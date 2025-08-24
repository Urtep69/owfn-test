import type { TokenDetails } from '../types.ts';
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { QUICKNODE_RPC_URL, MOCK_TOKEN_DETAILS } from '../constants.ts';

async function safeFetchJson(url: string) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`API request to ${url} failed with status ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error(`Error fetching from ${url}:`, e);
        return null;
    }
}

export default async function handler(req: any, res: any) {
    const mintAddress = req.query?.mint;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }
    
    try {
        new PublicKey(mintAddress); // Validate public key format first
    } catch (e) {
        return res.status(400).json({ error: "Invalid mint address format." });
    }

    try {
        const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
        const responseData: Partial<TokenDetails> = { mintAddress };

        // --- Fetch data from Birdeye and RPC in parallel ---
        const [birdeyeData, onChainData] = await Promise.all([
            safeFetchJson(`https://public-api.birdeye.so/defi/token_overview?address=${mintAddress}`),
            connection.getParsedAccountInfo(new PublicKey(mintAddress)).catch(e => {
                console.error(`RPC call failed for ${mintAddress}:`, e);
                return null; // Don't crash if RPC fails
            })
        ]);

        let dataFound = false;

        // --- Step 1: Populate with Birdeye for Market Data ---
        if (birdeyeData?.success && birdeyeData.data) {
            dataFound = true;
            const data = birdeyeData.data;
            responseData.name = data.name;
            responseData.symbol = data.symbol;
            responseData.logo = data.logoURI;
            responseData.decimals = data.decimals;
            responseData.pricePerToken = data.price || 0;
            responseData.marketCap = data.mc;
            responseData.volume24h = data.v24hUSD;
            responseData.price24hChange = data.v24hChangePercent;
            responseData.liquidity = data.liquidity;
            responseData.holders = data.holders;
            responseData.fdv = data.fdv;
            if (data.txs24h) {
                responseData.txns = { h24: { buys: data.txs24h.buys, sells: data.txs24h.sells } };
            }
        }

        // --- Step 2: Populate with On-Chain Data for Security Details ---
        if (onChainData?.value) {
            dataFound = true;
            const programOwner = onChainData.value.owner.toBase58();
            if (programOwner === TOKEN_2022_PROGRAM_ID.toBase58()) {
                responseData.tokenStandard = 'Token-2022';
            } else if (programOwner === TOKEN_PROGRAM_ID.toBase58()) {
                responseData.tokenStandard = 'SPL Token';
            }

            const info = (onChainData.value.data as ParsedAccountData)?.parsed?.info;
            if (info) {
                responseData.decimals = info.decimals; // On-chain is the source of truth
                if (info.supply) {
                    responseData.totalSupply = Number(BigInt(info.supply)) / (10 ** info.decimals);
                }
                responseData.mintAuthority = info.mintAuthority ?? null;
                responseData.freezeAuthority = info.freezeAuthority ?? null;
            }
        }
        
        // --- Final Fallbacks and Cleanup ---
        const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
        if (mockDetailsKey) {
            responseData.description = MOCK_TOKEN_DETAILS[mockDetailsKey].description;
        }
        responseData.name = responseData.name || 'Unknown Token';
        responseData.symbol = responseData.symbol || `${mintAddress.slice(0,4)}...`;

        // If neither Birdeye nor RPC returned any data, it's a 404.
        if (!dataFound) {
             return res.status(404).json({ error: `No on-chain or market data could be found for mint: ${mintAddress}.` });
        }
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}