import type { TokenDetails, TokenExtension, LiquidityPool } from '../lib/types.js';

const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

function calculateMarketCap(price: number, supply: number): number {
    if (!price || !supply) return 0;
    return price * supply;
}

// Helper to map DEX program IDs to names and build URLs
const getDexInfo = (programId: string, address: string): { name: 'Raydium' | 'Orca' | 'Meteora' | 'Unknown'; url: string } => {
    switch (programId) {
        case '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': // Raydium CLMM
        case '58oQChx4yWmvKdwLLZzBi4ChoCc2fqbcz2j81LuW9jCV': // Raydium Liquidity Pool V4
            return { name: 'Raydium', url: `https://raydium.io/liquidity/pool-info/?ammId=${address}` };
        case 'whirLbMiF6mS2i5sS4GD53devN822iH2p9tPqXhdGL': // Orca Whirlpools
            return { name: 'Orca', url: `https://www.orca.so/whirlpools/view/${address}` };
        case 'METEORA_PROGRAM_ID_PLACEHOLDER': // Replace with Meteora's actual program ID if available
            return { name: 'Meteora', url: `https://app.meteora.ag/pools/${address}` };
        default:
            return { name: 'Unknown', url: `https://solscan.io/account/${address}` };
    }
};

export default async function handler(req: any, res: any) {
    const mintAddress = req.query?.mint;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }
    
    if (!process.env.HELIUS_API_KEY) {
        console.error("Helius API key is not configured.");
        return res.status(500).json({ error: "Server configuration error for Helius API." });
    }

    try {
        const response = await fetch(HELIUS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'owfn-token-info',
                method: 'getAsset',
                params: {
                    id: mintAddress,
                    displayOptions: {
                        showFungible: true,
                    }
                },
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Helius API error for getAsset: ${response.status}`, errorText);
            return res.status(response.status).json({ error: `Helius API Error: ${errorText}` });
        }
        
        const jsonResponse = await response.json();
        const asset = jsonResponse.result;
        
        if (!asset) {
            return res.status(404).json({ error: `No data could be found for mint: ${mintAddress}.` });
        }
        
        // Defensively access nested properties
        const ownership = asset.ownership || {};
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const authorities = asset.authorities || [];
        const tokenInfo = asset.token_info || {};
        const priceInfo = tokenInfo.price_info || {};
        const supply = tokenInfo.supply ? BigInt(tokenInfo.supply) : 0n;
        const decimals = tokenInfo.decimals ?? 9;
        const price = priceInfo.price_per_token || 0;
        
        const totalSupply = Number(supply) / (10 ** decimals);

        const responseData: Partial<TokenDetails> = {
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || `${asset.id.slice(0, 4)}...`,
            logo: links.image || null,
            description: metadata.description || undefined,
            links: links,
            
            pricePerToken: price,
            decimals: decimals,
            totalSupply: totalSupply,
            holders: ownership.delegated ? ownership.owner_count + 1 : ownership.owner_count,
            marketCap: calculateMarketCap(price, totalSupply),
            
            creatorAddress: asset.grouping?.[0]?.group_value,
            createdAt: asset.created_at,

            mintAuthority: authorities.find((auth: any) => auth.scopes?.includes('mint'))?.address || null,
            freezeAuthority: authorities.find((auth: any) => auth.scopes?.includes('freeze'))?.address || null,
            updateAuthority: authorities.find((auth: any) => auth.scopes?.includes('metadata_write'))?.address || null,
            
            tokenStandard: asset.interface === 'FungibleToken' ? 'SPL Token' : (asset.interface === 'FungibleAsset' ? 'Token-2022' : asset.interface),
            extensions: asset.spl_token_2022_info?.extensions?.map((ext: any) => ({ extension: ext.extension, state: ext.state })) || [],

            // Placeholder, requires another API call to a DEX aggregator
            volume24h: 0, 
            liquidityPools: [],
        };

        // --- Fetch Liquidity Pool Info ---
        try {
            const pairsResponse = await fetch(HELIUS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'owfn-token-pairs',
                    method: 'getFungibleTokenRating',
                    params: {
                        mint: mintAddress,
                    },
                }),
            });
            if (pairsResponse.ok) {
                const pairsJson = await pairsResponse.json();
                const markets = pairsJson.result?.markets;
                if (Array.isArray(markets)) {
                    responseData.liquidityPools = markets.map((market: any) => {
                        const dex = getDexInfo(market.program_id, market.address);
                        return {
                            exchange: dex.name,
                            lpMintAddress: market.address,
                            url: dex.url,
                        };
                    });
                }
            }
        } catch (pairError) {
            console.warn("Could not fetch liquidity pair info:", pairError);
        }
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}
