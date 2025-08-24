import type { TokenDetails } from '../types.ts';
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { QUICKNODE_RPC_URL } from '../constants.ts';

// Main handler function
export default async function handler(req: any, res: any) {
    const { mint: mintAddress } = req.query;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }

    const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
    const responseData: Partial<TokenDetails> = { mintAddress };

    try {
        // --- Step 1: Fetch metadata from Jupiter Token List (in its own try-catch) ---
        try {
            const jupiterResponse = await fetch('https://token.jup.ag/all');
            if (jupiterResponse.ok) {
                const tokenList = await jupiterResponse.json();
                const tokenMeta = tokenList.find((t: any) => t.address === mintAddress);
                if (tokenMeta) {
                    responseData.name = tokenMeta.name;
                    responseData.symbol = tokenMeta.symbol;
                    responseData.logo = tokenMeta.logoURI;
                    responseData.decimals = tokenMeta.decimals;
                    responseData.description = tokenMeta.description;
                    responseData.links = tokenMeta.extensions;
                }
            }
        } catch (e) {
            console.warn(`Could not fetch metadata from Jupiter for ${mintAddress}:`, e);
        }
        
        // --- Step 2: Fetch on-chain data (in its own try-catch) ---
        try {
            const mintPublicKey = new PublicKey(mintAddress);
            const accountInfo = await connection.getParsedAccountInfo(mintPublicKey);
            
            if (accountInfo?.value) {
                const programOwner = accountInfo.value.owner.toBase58();
                if (programOwner === TOKEN_2022_PROGRAM_ID.toBase58()) {
                    responseData.tokenStandard = 'Token-2022';
                } else if (programOwner === TOKEN_PROGRAM_ID.toBase58()) {
                    responseData.tokenStandard = 'SPL Token';
                }

                // **ULTIMATE ROBUSTNESS**: Access parsed data with extreme caution.
                const info = (accountInfo.value.data as ParsedAccountData)?.parsed?.info;
                
                if (info && typeof info === 'object') {
                    if (typeof info.decimals === 'number') {
                        responseData.decimals = info.decimals;
                        if (info.supply) {
                            try {
                                const supplyBigInt = BigInt(info.supply);
                                const divisor = 10n ** BigInt(info.decimals);
                                responseData.totalSupply = Number(supplyBigInt) / Number(divisor);
                            } catch (parseError) {
                                console.warn(`Could not parse supply for ${mintAddress}:`, info.supply, parseError);
                                responseData.totalSupply = 0; // Fallback
                            }
                        }
                    }
                    responseData.mintAuthority = info.mintAuthority ?? null;
                    responseData.freezeAuthority = info.freezeAuthority ?? null;
                } else {
                     console.warn(`On-chain data for ${mintAddress} was not in the expected parsed format.`);
                }
            } else {
                console.warn(`No on-chain account info found for mint address ${mintAddress}.`);
            }
        } catch(e) {
            console.warn(`Could not fetch on-chain account info for ${mintAddress}. Error:`, e);
        }

        // --- Step 3: Fetch LIVE market data from DexScreener (Primary) (in its own try-catch) ---
        let marketDataFetched = false;
        try {
            const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`;
            const dexResponse = await fetch(dexScreenerUrl, { headers: { 'User-Agent': 'OWFN/1.0' } });
            if (dexResponse.ok) {
                const dexData = await dexResponse.json();
                
                // FINAL ROBUSTNESS CHECK: Ensure dexData and its `pairs` property are a non-empty array before proceeding.
                // This handles cases where `pairs` is null or undefined for unlisted tokens, which was the source of the 500 error.
                if (dexData && Array.isArray(dexData.pairs) && dexData.pairs.length > 0) {
                    const pairs = dexData.pairs;
                    const primaryPair = pairs.reduce((prev: any, current: any) => 
                        (prev?.liquidity?.usd ?? 0) > (current?.liquidity?.usd ?? 0) ? prev : current
                    );

                    if (primaryPair) {
                        responseData.pricePerToken = parseFloat(primaryPair.priceUsd) || 0;
                        responseData.marketCap = primaryPair.marketCap ?? 0;
                        responseData.fdv = primaryPair.fdv ?? 0;
                        responseData.volume24h = primaryPair.volume?.h24 || 0;
                        responseData.price24hChange = primaryPair.priceChange?.h24 || 0;
                        responseData.liquidity = primaryPair.liquidity?.usd || 0;
                        responseData.pairAddress = primaryPair.pairAddress;
                        responseData.poolCreatedAt = primaryPair.pairCreatedAt ? new Date(primaryPair.pairCreatedAt).getTime() : undefined;
                        responseData.txns = {
                            h24: {
                                buys: primaryPair.txns?.h24?.buys ?? 0,
                                sells: primaryPair.txns?.h24?.sells ?? 0
                            }
                        };
                        responseData.dexId = primaryPair.dexId;
                        marketDataFetched = true;
                    }
                }
            }
        } catch (dexError) {
            console.warn(`Could not fetch market data from DexScreener for ${mintAddress}:`, dexError);
        }

        // --- Step 4: Fallback to CoinGecko (in its own try-catch) ---
        if (!marketDataFetched) {
            try {
                const coingeckoUrl = `https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${mintAddress}&vs_currencies=usd`;
                const cgResponse = await fetch(coingeckoUrl);
                if (cgResponse.ok) {
                    const cgData = await cgResponse.json();
                    if (cgData?.[mintAddress]?.usd) {
                        responseData.pricePerToken = cgData[mintAddress].usd;
                        if(responseData.totalSupply && responseData.totalSupply > 0) {
                            responseData.marketCap = responseData.totalSupply * responseData.pricePerToken;
                        }
                    }
                }
            } catch(cgError) {
                console.warn(`Could not fetch market data from CoinGecko for ${mintAddress}:`, cgError);
            }
        }
        
        // --- Final Cleanup & Response ---
        if (!responseData.name) responseData.name = 'Unknown Token';
        if (!responseData.symbol) responseData.symbol = `${mintAddress.slice(0,4)}...${mintAddress.slice(-4)}`;
        responseData.updateAuthority = null; // Assume null as it's not easily available

        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve token data. Reason: ${errorMessage}` });
    }
}