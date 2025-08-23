import type { TokenDetails, Trade, LiquidityPool, Socials } from '../types.ts';
import { BIRDEYE_API_BASE_URL } from '../constants.ts';

// --- CONSTANTS ---
const HELIUS_API_KEY = 'a37ba545-d429-43e3-8f6d-d51128c49da9';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const BIRDEYE_API_KEY_SERVER = process.env.BIRDEYE_API_KEY;

// A custom error class to signal a definitive "not found" state.
class TokenNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TokenNotFoundError';
    }
}

// --- DATA FETCHING FUNCTIONS ---
async function fetchTokenDetails(mintAddress: string): Promise<TokenDetails> {
    // Step 1: Get critical on-chain data. This will throw if the token doesn't exist.
    let onChainData: Partial<TokenDetails> = {};
    try {
        const heliusResponse = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAsset',
                params: { id: mintAddress, displayOptions: { showFungible: true } },
            }),
        });

        if (!heliusResponse.ok) throw new Error(`Helius API returned status ${heliusResponse.status}`);
        const heliusData = await heliusResponse.json();
        if (heliusData.error) throw new Error(`Helius RPC Error: ${heliusData.error.message}`);
        
        const asset = heliusData.result;
        if (!asset || !asset.id) {
            throw new TokenNotFoundError(`Token with mint address ${mintAddress} not found on-chain.`);
        }

        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const tokenInfo = asset.token_info || {};
        const ownership = asset.ownership || {};
        
        const decimals = tokenInfo.decimals ?? 0;
        const totalSupply = parseFloat(tokenInfo.supply) / Math.pow(10, decimals);
        const tokenStandard = ownership.program === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' ? 'Token-2022' : 'SPL Token';
        
        const authorities = Array.isArray(asset.authorities) ? asset.authorities : [];
        const updateAuthority = authorities.find(a => a?.scopes?.includes('metadata_writer'))?.address;

        onChainData = {
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || 'N/A',
            logo: links.image || null,
            decimals,
            totalSupply,
            description: metadata.description || null,
            socials: { website: links.website, twitter: links.twitter, telegram: links.telegram, discord: links.discord },
            mintAuthority: tokenInfo.mint_authority ?? null,
            freezeAuthority: tokenInfo.freeze_authority ?? null,
            updateAuthority: updateAuthority ?? null,
            tokenStandard,
        };
    } catch (error) {
        if (error instanceof TokenNotFoundError) throw error;
        console.error(`[FATAL] Helius data fetch failed for ${mintAddress}:`, error);
        throw new TokenNotFoundError(`Failed to fetch essential on-chain data for ${mintAddress}.`);
    }

    // Step 2 & 3: Get supplemental data from other sources.
    let marketData: Partial<TokenDetails> = {};
    try {
        const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`;
        const dexResponse = await fetch(dexScreenerUrl);
        if (dexResponse.ok) {
            const dexData = await dexResponse.json();
            if (dexData.pairs && dexData.pairs.length > 0) {
                const sortedPairs = [...dexData.pairs]
                    .filter((p: any) => p.liquidity?.usd)
                    .sort((a: any, b: any) => b.liquidity.usd - a.liquidity.usd);

                marketData.liquidityPools = sortedPairs.map((p: any): LiquidityPool => ({
                    dexId: p.dexId, pairAddress: p.pairAddress, liquidity: p.liquidity?.usd,
                    baseToken: { symbol: p.baseToken?.symbol, address: p.baseToken?.address },
                    quoteToken: { symbol: p.quoteToken?.symbol, address: p.quoteToken?.address },
                    url: p.url,
                }));
                
                const primaryPair = sortedPairs[0];
                if (primaryPair) {
                    marketData.pricePerToken = parseFloat(primaryPair.priceUsd) || 0;
                    marketData.fdv = primaryPair.fdv ?? 0;
                    marketData.volume = { h24: primaryPair.volume?.h24 || 0, h6: primaryPair.volume?.h6 || 0, h1: primaryPair.volume?.h1 || 0 };
                    marketData.priceChange = { h24: primaryPair.priceChange?.h24 || 0, h6: primaryPair.priceChange?.h6 || 0, h1: primaryPair.priceChange?.h1 || 0, m5: primaryPair.priceChange?.m5 || 0 };
                    marketData.liquidity = primaryPair.liquidity ? { usd: primaryPair.liquidity.usd, base: primaryPair.liquidity.base, quote: primaryPair.liquidity.quote } : undefined;
                    marketData.pairAddress = primaryPair.pairAddress;
                    marketData.dexId = primaryPair.dexId;
                    marketData.quoteToken = { symbol: primaryPair.quoteToken.symbol, address: primaryPair.quoteToken.address };
                    marketData.chainId = primaryPair.chainId;
                    marketData.poolCreatedAt = primaryPair.pairCreatedAt ? new Date(primaryPair.pairCreatedAt).getTime() : undefined;
                    marketData.txns = { h24: { buys: primaryPair.txns?.h24?.buys ?? 0, sells: primaryPair.txns?.h24?.sells ?? 0, buysVolume: 0, sellsVolume: 0 }};
                }
            }
        } else {
             console.warn(`DexScreener API failed with status ${dexResponse.status} for ${mintAddress}.`);
        }
    } catch (error) {
        console.warn(`Failed to process DexScreener data for ${mintAddress}:`, error);
    }

    let birdeyeData: Partial<TokenDetails> = {};
    if (BIRDEYE_API_KEY_SERVER) {
        try {
            const birdeyeUrl = `${BIRDEYE_API_BASE_URL}/defi/token_overview?address=${mintAddress}`;
            const birdeyeResponse = await fetch(birdeyeUrl, {
                headers: { 'X-API-KEY': BIRDEYE_API_KEY_SERVER, 'accept': 'application/json', 'x-chain': 'solana' }
            });
            if (birdeyeResponse.ok) {
                const jsonResponse = await birdeyeResponse.json();
                const data = jsonResponse?.data;
                if (data) {
                    birdeyeData.holders = data.holders;
                    if (data.mc) birdeyeData.fdv = data.mc;
                    if (data.supply?.circulating) birdeyeData.circulatingSupply = data.supply.circulating;
                    if (data.extensions) {
                        birdeyeData.socials = {
                            website: data.extensions.website || onChainData.socials?.website,
                            twitter: data.extensions.twitter || onChainData.socials?.twitter,
                            telegram: data.extensions.telegram || onChainData.socials?.telegram,
                            discord: data.extensions.discord || onChainData.socials?.discord,
                        };
                    }
                }
            } else {
                 console.warn(`Birdeye API failed with status ${birdeyeResponse.status} for ${mintAddress}.`);
            }
        } catch (error) {
            console.warn(`Failed to fetch or parse Birdeye data for ${mintAddress}:`, error);
        }
    }

    // Step 4: Combine all data sources
    return {
        ...onChainData,
        ...marketData,
        ...birdeyeData,
        socials: { ...onChainData.socials, ...birdeyeData.socials },
        // Ensure required fields have default values
        name: onChainData.name!, symbol: onChainData.symbol!,
        mintAddress: onChainData.mintAddress!, logo: onChainData.logo!,
        balance: 0, usdValue: 0, pricePerToken: marketData.pricePerToken || 0,
        decimals: onChainData.decimals!, totalSupply: onChainData.totalSupply!,
    };
}


async function fetchTokenTrades(pairAddress: string): Promise<Trade[]> {
    try {
        const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}/swaps?desc=true&limit=40`;
        const response = await fetch(dexScreenerUrl);
        if (!response.ok) throw new Error(`DexScreener swaps API failed with status ${response.status}`);
        
        const data = await response.json();
        if (!data.swaps || !Array.isArray(data.swaps)) return [];

        return data.swaps.map((swap: any): Trade => ({
            timestamp: new Date(swap.timestamp).getTime(),
            type: swap.type,
            priceUsd: parseFloat(swap.priceUsd),
            amountQuote: parseFloat(swap.amountQuote),
            amountBase: parseFloat(swap.amountBase),
            maker: swap.maker,
            txHash: swap.txHash,
        }));
    } catch (error) {
        console.error(`Failed to fetch trades for pair ${pairAddress}:`, error);
        return []; // Return empty array on failure
    }
}


export default async function handler(req: any, res: any) {
    const { mint: mintAddress, type, pair: pairAddress } = req.query;

    try {
        if (type === 'trades') {
            if (!pairAddress || typeof pairAddress !== 'string') {
                return res.status(400).json({ error: "Pair address is required for fetching trades." });
            }
            const trades = await fetchTokenTrades(pairAddress);
            return res.status(200).json(trades);
        }

        if (!mintAddress || typeof mintAddress !== 'string') {
            return res.status(400).json({ error: "Mint address is required." });
        }
        const details = await fetchTokenDetails(mintAddress);
        return res.status(200).json(details);

    } catch (error) {
        if (error instanceof TokenNotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        
        console.error(`[FATAL] Unhandled error in token-info API for ${JSON.stringify(req.query)}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `An unexpected server error occurred. Reason: ${errorMessage}` });
    }
}
