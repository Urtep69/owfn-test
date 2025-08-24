
import type { TokenDetails } from '../types.ts';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

// Main handler function
export default async function handler(req: any, res: any) {
    const { mint: mintAddress } = req.query;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }

    const quicknodeUrl = 'https://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/';
    const connection = new Connection(quicknodeUrl, 'confirmed');

    try {
        const responseData: Partial<TokenDetails> = { mintAddress };

        // --- Step 1: Fetch metadata from Jupiter Token List ---
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
                }
            }
        } catch (e) {
            console.warn(`Could not fetch metadata from Jupiter for ${mintAddress}:`, e);
        }
        
        // --- Step 2: Fetch on-chain data using standard getParsedAccountInfo ---
        try {
            const mintPublicKey = new PublicKey(mintAddress);
            const accountInfo = await connection.getParsedAccountInfo(mintPublicKey);
            
            if (accountInfo.value) {
                const programOwner = accountInfo.value.owner.toBase58();
                if (programOwner === TOKEN_2022_PROGRAM_ID.toBase58()) {
                    responseData.tokenStandard = 'Token-2022';
                } else if (programOwner === TOKEN_PROGRAM_ID.toBase58()) {
                    responseData.tokenStandard = 'SPL Token';
                }

                const info = (accountInfo.value.data as any)?.parsed?.info;
                if (info) {
                    responseData.decimals = info.decimals;
                    responseData.totalSupply = parseFloat(info.supply) / Math.pow(10, info.decimals);
                    responseData.mintAuthority = info.mintAuthority;
                    responseData.freezeAuthority = info.freezeAuthority;
                }
            } else {
                 throw new Error(`No account info found for mint address.`);
            }
        } catch(e) {
             console.error(`Could not fetch on-chain account info for ${mintAddress}:`, e);
             // This is a critical failure, we can't proceed without decimals/supply
             return res.status(500).json({ error: `Failed to retrieve on-chain data. Reason: ${ (e as Error).message }` });
        }

        // --- Step 3: Fetch LIVE market data from DexScreener (Primary) ---
        let marketDataFetched = false;
        try {
            const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`;
            const dexResponse = await fetch(dexScreenerUrl, { headers: { 'User-Agent': 'OWFN/1.0' } });
            if (dexResponse.ok) {
                const dexData = await dexResponse.json();
                if (dexData.pairs && dexData.pairs.length > 0) {
                    const primaryPair = dexData.pairs.reduce((prev: any, current: any) => 
                        (prev.liquidity?.usd ?? 0) > (current.liquidity?.usd ?? 0) ? prev : current
                    );
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
        } catch (dexError) {
            console.warn(`Could not fetch market data from DexScreener for ${mintAddress}:`, dexError);
        }
        
        // --- Final Fallbacks and Cleanup ---
        if (!responseData.name) responseData.name = 'Unknown Token';
        if (!responseData.symbol) responseData.symbol = `${mintAddress.slice(0,4)}...${mintAddress.slice(-4)}`;
        if (responseData.decimals === undefined) responseData.decimals = 0;
        
        // As we cannot reliably get creator/update authority from standard RPC, we set sane defaults.
        // For a token like wSOL, all authorities are revoked, so this is a reasonable display.
        responseData.creatorAddress = 'Unknown...own';
        responseData.updateAuthority = null;


        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve token data. Reason: ${errorMessage}` });
    }
}
