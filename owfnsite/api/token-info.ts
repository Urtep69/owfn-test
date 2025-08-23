import type { TokenDetails, Trade, LiquidityPool, Socials } from '../types.ts';

const HELIUS_API_KEY = 'a37ba545-d429-43e3-8f6d-d51128c49da9';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

async function fetchTokenDetails(mintAddress: string): Promise<Partial<TokenDetails>> {
    // Step 1: Fetch asset data from Helius for on-chain details and metadata
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

    if (!heliusResponse.ok) throw new Error(`Helius API failed with status ${heliusResponse.status}`);
    
    const heliusData = await heliusResponse.json();
    if (heliusData.error) throw new Error(`Helius RPC Error: ${heliusData.error.message}`);
    
    const asset = heliusData.result;
    if (!asset || !asset.id) throw new Error('Token not found on-chain via Helius.');

    // --- Process Helius Data ---
    const content = asset.content || {};
    const metadata = content.metadata || {};
    const links = content.links || {};
    const tokenInfo = asset.token_info || {};
    const ownership = asset.ownership || {};
    
    const decimals = tokenInfo.decimals ?? 0;
    const totalSupply = parseFloat(tokenInfo.supply) / Math.pow(10, decimals);

    const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
    const tokenStandard = ownership.program === TOKEN_2022_PROGRAM_ID ? 'Token-2022' : 'SPL Token';
    
    const authorities = Array.isArray(asset.authorities) ? asset.authorities : [];
    const updateAuthority = authorities.find(a => a?.scopes?.includes('metadata_writer'))?.address;

    const socials: Socials = {};
    if (links.website) socials.website = links.website;
    if (links.twitter) socials.twitter = links.twitter;
    if (links.telegram) socials.telegram = links.telegram;
    if (links.discord) socials.discord = links.discord;

    const onChainData: Partial<TokenDetails> = {
        mintAddress: asset.id,
        name: metadata.name || 'Unknown Token',
        symbol: metadata.symbol || 'N/A',
        logo: links.image || null,
        decimals,
        totalSupply,
        description: metadata.description || null,
        socials,
        creatorAddress: asset.grouping?.find((g: any) => g.group_key === 'collection')?.group_value || 'Unknown',
        mintAuthority: tokenInfo.mint_authority ?? null,
        freezeAuthority: tokenInfo.freeze_authority ?? null,
        updateAuthority: updateAuthority ?? null,
        tokenStandard,
        holders: undefined, 
        circulatingSupply: undefined,
    };

    // Step 2: Fetch market data from DexScreener to find all trading pairs.
    const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`;
    const dexResponse = await fetch(dexScreenerUrl);
    if (!dexResponse.ok) console.warn(`DexScreener API failed with status ${dexResponse.status}`);
    
    const dexData = dexResponse.ok ? await dexResponse.json() : { pairs: null };
    let primaryPair = null;
    let allPairs: LiquidityPool[] = [];

    if (dexData.pairs && dexData.pairs.length > 0) {
        const sortedPairs = [...dexData.pairs]
             .filter((p: any) => p.liquidity?.usd)
             .sort((a: any, b: any) => b.liquidity.usd - a.liquidity.usd);
        
        primaryPair = sortedPairs[0];

        allPairs = sortedPairs.map((p: any): LiquidityPool => ({
            dexId: p.dexId,
            pairAddress: p.pairAddress,
            liquidity: p.liquidity?.usd,
            baseToken: { symbol: p.baseToken?.symbol, address: p.baseToken?.address },
            quoteToken: { symbol: p.quoteToken?.symbol, address: p.quoteToken?.address },
            url: p.url,
        }));
    }

    const marketData: Partial<TokenDetails> = {
        liquidityPools: allPairs
    };

    if (primaryPair) {
        marketData.pricePerToken = parseFloat(primaryPair.priceUsd) || 0;
        marketData.fdv = primaryPair.fdv ?? 0;
        marketData.volume = {
            h24: primaryPair.volume?.h24 || 0,
            h6: primaryPair.volume?.h6 || 0,
            h1: primaryPair.volume?.h1 || 0,
        };
        marketData.priceChange = {
            h24: primaryPair.priceChange?.h24 || 0,
            h6: primaryPair.priceChange?.h6 || 0,
            h1: primaryPair.priceChange?.h1 || 0,
            m5: primaryPair.priceChange?.m5 || 0,
        };
        marketData.liquidity = primaryPair.liquidity ? {
            usd: primaryPair.liquidity.usd,
            base: primaryPair.liquidity.base,
            quote: primaryPair.liquidity.quote,
        } : undefined;
        marketData.pairAddress = primaryPair.pairAddress;
        marketData.poolCreatedAt = primaryPair.pairCreatedAt ? new Date(primaryPair.pairCreatedAt).getTime() : undefined;
        
        // Calculate buys/sells volume
        let buysVolume = 0;
        let sellsVolume = 0;
        if(primaryPair.txns?.h24?.swaps && Array.isArray(primaryPair.txns.h24.swaps)) {
            primaryPair.txns.h24.swaps.forEach((swap:any) => {
                if(swap.type === 'buy') buysVolume += parseFloat(swap.amountUsd);
                if(swap.type === 'sell') sellsVolume += parseFloat(swap.amountUsd);
            });
        }
        
        marketData.txns = {
            h24: {
                buys: primaryPair.txns?.h24?.buys ?? 0,
                sells: primaryPair.txns?.h24?.sells ?? 0,
                buysVolume: buysVolume,
                sellsVolume: sellsVolume,
            }
        };
        marketData.dexId = primaryPair.dexId;
        marketData.baseToken = { symbol: primaryPair.baseToken.symbol, address: primaryPair.baseToken.address };
        marketData.quoteToken = { symbol: primaryPair.quoteToken.symbol, address: primaryPair.quoteToken.address };
        marketData.chainId = primaryPair.chainId;
        marketData.dexScreenerUrl = primaryPair.url;
    }
    
    // Step 3: Combine and return
    return { ...onChainData, ...marketData };
}

async function fetchTokenTrades(pairAddress: string): Promise<Trade[]> {
    const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}/swaps?desc=true&limit=40`;
    const response = await fetch(dexScreenerUrl);
    if (!response.ok) throw new Error(`DexScreener swaps API failed with status ${response.status}`);
    
    const data = await response.json();
    if (!data.swaps) return [];

    const trades: Trade[] = data.swaps.map((swap: any) => ({
        timestamp: new Date(swap.timestamp).getTime(),
        type: swap.type,
        priceUsd: parseFloat(swap.priceUsd),
        amountQuote: parseFloat(swap.amountQuote),
        amountBase: parseFloat(swap.amountBase),
        maker: swap.maker,
        txHash: swap.txHash,
    }));
    return trades;
}

// Main handler function
export default async function handler(req: any, res: any) {
    const { mint: mintAddress, type, pair: pairAddress } = req.query;

    try {
        if (type === 'trades') {
            if (!pairAddress || typeof pairAddress !== 'string') {
                return res.status(400).json({ error: "Pair address is required for fetching trades." });
            }
            const trades = await fetchTokenTrades(pairAddress);
            return res.status(200).json(trades);
        } else {
            if (!mintAddress || typeof mintAddress !== 'string') {
                return res.status(400).json({ error: "Mint address is required." });
            }
            const details = await fetchTokenDetails(mintAddress);
            return res.status(200).json(details);
        }
    } catch (error) {
        console.error(`[FATAL] Error in token-info API for query ${JSON.stringify(req.query)}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve token data. Reason: ${errorMessage}` });
    }
}