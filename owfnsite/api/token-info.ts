import type { TokenDetails } from '../types.ts';
import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { QUICKNODE_RPC_URL, MOCK_TOKEN_DETAILS } from '../constants.ts';

// Helper to safely fetch and parse JSON, returning null on any error.
async function safeFetchJson(url: string, options: RequestInit = {}) {
    try {
        const response = await fetch(url, options);
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
        const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
        const responseData: Partial<TokenDetails> = { mintAddress };

        // --- Fetch data from multiple sources in parallel for speed and resilience ---
        const [jupPriceData, jupTokenListData, birdeyeData, onChainData] = await Promise.all([
            safeFetchJson(`https://price.jup.ag/v4/price?ids=${mintAddress}`),
            safeFetchJson(`https://token.jup.ag/all`), // For reliable metadata
            safeFetchJson(`https://public-api.birdeye.so/defi/token_overview?address=${mintAddress}`), // For extended market data
            connection.getParsedAccountInfo(new PublicKey(mintAddress)).catch(e => {
                console.error(`Failed to fetch on-chain data for ${mintAddress}:`, e);
                return null;
            })
        ]);

        // --- Step 1: Populate with Jupiter Token List Metadata (High Reliability) ---
        if (jupTokenListData) {
            const tokenInfo = jupTokenListData.find((t: any) => t.address === mintAddress);
            if (tokenInfo) {
                responseData.name = tokenInfo.name;
                responseData.symbol = tokenInfo.symbol;
                responseData.logo = tokenInfo.logoURI;
                responseData.decimals = tokenInfo.decimals;
            }
        }
        
        // --- Step 2: Populate with Jupiter Price (High Reliability) ---
        if (jupPriceData?.data?.[mintAddress]) {
            responseData.pricePerToken = jupPriceData.data[mintAddress].price || 0;
        }

        // --- Step 3: Populate with Birdeye Market Data (if available, as a secondary source) ---
        if (birdeyeData?.success && birdeyeData.data) {
            const data = birdeyeData.data;
            // Use Birdeye data as a fallback if Jupiter's was missing
            responseData.name = responseData.name || data.name;
            responseData.symbol = responseData.symbol || data.symbol;
            responseData.logo = responseData.logo || data.logoURI;
            responseData.decimals = responseData.decimals ?? data.decimals;
            responseData.pricePerToken = responseData.pricePerToken || data.price || 0;
            
            // Add extended market data that Jupiter doesn't provide
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

        // --- Step 4: Populate with On-Chain Data (the ultimate source of truth for supply/authorities) ---
        if (onChainData?.value) {
            const programOwner = onChainData.value.owner.toBase58();
            if (programOwner === TOKEN_2022_PROGRAM_ID.toBase58()) {
                responseData.tokenStandard = 'Token-2022';
            } else if (programOwner === TOKEN_PROGRAM_ID.toBase58()) {
                responseData.tokenStandard = 'SPL Token';
            }

            const info = (onChainData.value.data as ParsedAccountData)?.parsed?.info;
            if (info && typeof info === 'object') {
                if (typeof info.decimals === 'number') {
                    responseData.decimals = info.decimals; // Override with on-chain data
                    if (info.supply) {
                        responseData.totalSupply = Number(BigInt(info.supply)) / (10 ** info.decimals);
                    }
                }
                responseData.mintAuthority = info.mintAuthority ?? null;
                responseData.freezeAuthority = info.freezeAuthority ?? null;
            }
        }
        
        // --- Final Fallbacks and Cleanup ---
        const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
        if (mockDetailsKey) {
            responseData.description = responseData.description || MOCK_TOKEN_DETAILS[mockDetailsKey].description;
        }
        responseData.name = responseData.name || 'Unknown Token';
        responseData.symbol = responseData.symbol || `${mintAddress.slice(0,4)}...${mintAddress.slice(-4)}`;
        responseData.updateAuthority = null; // Assume null as it's not easily available and often same as mint authority

        // If after all sources, we still have barely any data, return an error.
        if (Object.keys(responseData).length <= 2) {
             return res.status(404).json({ error: `No data could be found for mint address: ${mintAddress}.` });
        }
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}
