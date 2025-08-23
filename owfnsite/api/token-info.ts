import type { TokenDetails, Trade } from '../types.ts';

const HELIUS_API_KEY = 'a37ba545-d429-43e3-8f6d-d51128c49da9';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

async function fetchTokenDetails(mintAddress: string): Promise<Partial<TokenDetails>> {
    // Step 1: Fetch market data from DexScreener first to find the best trading pair.
    const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`;
    const dexResponse = await fetch(dexScreenerUrl);
    if (!dexResponse.ok) console.warn(`DexScreener API failed with status ${dexResponse.status}`);
    
    const dexData = dexResponse.ok ? await dexResponse.json() : { pairs: null };
    let primaryPair = null;

    if (dexData.pairs && dexData.pairs.length > 0) {
        // Find the most liquid pair, prioritizing pairs against well-known bases (SOL, USDC)
        const wellKnownBases = ['SOL', 'USDC', 'USDT'];
        primaryPair = dexData.pairs
            .filter((p: any) => p.liquidity?.usd)
            .sort((a: any, b: any) => {
                const aIsWellKnown = wellKnownBases.includes(a.baseToken.symbol);
                const bIsWellKnown = wellKnownBases.includes(b.baseToken.symbol);
                if (aIsWellKnown && !bIsWellKnown) return -1;
                if (!aIsWellKnown && bIsWellKnown) return 1;
                return b.liquidity.usd - a.liquidity.usd;
            })[0];
    }

    // Step 2: Fetch asset data from Helius for on-chain details and metadata
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

    // --- Combine data from both sources ---
    const content = asset.content || {};
    const metadata = content.metadata || {};
    const links = content.links || {};
    const tokenInfo = asset.token_info || {};
    const ownership = asset.ownership || {};
    
    const decimals = tokenInfo.decimals ?? 0;
    const totalSupply = parseFloat(tokenInfo.supply) / Math.pow(10, decimals);

    const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
    const tokenStandard = ownership.program === TOKEN_2022_PROGRAM_ID ? 'Token-2022' : 'SPL Token';
    
    // Find the update authority. Helius provides it in a separate array if it's a different type of authority.
    const authorities = Array.isArray(asset.authorities) ? asset.authorities : [];
    const updateAuthority = authorities.find(a => a?.scopes?.includes('metadata_writer'))?.address;


    const responseData: Partial<TokenDetails> = {
        mintAddress: asset.id,
        name: metadata.name || 'Unknown Token',
        symbol: metadata.symbol || 'N/A',
        logo: links.image || null,
        decimals,
        totalSupply,
        description: metadata.description || null,
        links: links,
        creatorAddress: asset.grouping?.find((g: any) => g.group_key === 'collection')?.group_value || 'Unknown',
        mintAuthority: tokenInfo.mint_authority ?? null,
        freezeAuthority: tokenInfo.freeze_authority ?? null,
        updateAuthority: updateAuthority ?? null,
        tokenStandard,
        holders: undefined, // N/A, requires dedicated indexing
        circulatingSupply: undefined, // N/A
        volatility: undefined, // N/A
    };

    if (primaryPair) {
        responseData.pricePerToken = parseFloat(primaryPair.priceUsd) || 0;
        responseData.fdv = primaryPair.fdv ?? 0;
        responseData.volume = {
            h24: primaryPair.volume?.h24 || 0,
            h6: primaryPair.volume?.h6 || 0,
            h1: primaryPair.volume?.h1 || 0,
        };
        responseData.priceChange = {
            h24: primaryPair.priceChange?.h24 || 0,
            h6: primaryPair.priceChange?.h6 || 0,
            h1: primaryPair.priceChange?.h1 || 0,
            m5: primaryPair.priceChange?.m5 || 0,
        };
        responseData.liquidity = primaryPair.liquidity ? {
            usd: primaryPair.liquidity.usd,
            base: primaryPair.liquidity.base,
            quote: primaryPair.liquidity.quote,
        } : undefined;
        responseData.pairAddress = primaryPair.pairAddress;
        responseData.poolCreatedAt = primaryPair.pairCreatedAt ? new Date(primaryPair.pairCreatedAt).getTime() : undefined;
        responseData.txns = {
            h24: {
                buys: primaryPair.txns?.h24?.buys ?? 0,
                sells: primaryPair.txns?.h24?.sells ?? 0
            }
        };
        responseData.dexId = primaryPair.dexId;
        responseData.baseToken = { symbol: primaryPair.baseToken.symbol, address: primaryPair.baseToken.address };
        responseData.quoteToken = { symbol: primaryPair.quoteToken.symbol, address: primaryPair.quoteToken.address };
        responseData.chainId = primaryPair.chainId;
        responseData.dexScreenerUrl = primaryPair.url;
    }

    return responseData;
}

async function fetchTokenTrades(pairAddress: string): Promise<Trade[]> {
    const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}/swaps?desc=true&limit=30`;
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