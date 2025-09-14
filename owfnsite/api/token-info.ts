import type { TokenDetails } from '../lib/types.js';

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

const DEX_PROGRAM_URLS: Record<string, { name: 'Raydium' | 'Orca' | 'Meteora' | 'Unknown'; urlPattern: string }> = {
    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': { name: 'Raydium', urlPattern: 'https://raydium.io/liquidity/pool-info/?ammId={address}' },
    '58oQChx4yWmvKdwLLZzBi4ChoCc2fqbcz2j81LuW9jCV': { name: 'Raydium', urlPattern: 'https://raydium.io/liquidity/pool-info/?ammId={address}' },
    'whirLbMiF6mS2i5sS4GD53devN822iH2p9tPqXhdGL': { name: 'Orca', urlPattern: 'https://www.orca.so/whirlpools/view/{address}' },
    'METEORA_PROGRAM_ID_PLACEHOLDER': { name: 'Meteora', urlPattern: 'https://app.meteora.ag/pools/{address}' }, // Placeholder, needs actual ID
};

const getDexInfo = (programId: string, address: string) => {
    const dex = DEX_PROGRAM_URLS[programId] || { name: 'Unknown', urlPattern: `https://solscan.io/account/${address}` };
    return { name: dex.name, url: dex.urlPattern.replace('{address}', address) };
};

export default async function handler(req: any, res: any) {
    const mintAddress = req.query?.mint;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }
    
    if (!process.env.HELIUS_API_KEY) {
        console.error("API key for Helius is not configured.");
        return res.status(500).json({ error: "Server API key configuration error." });
    }

    try {
        const assetPromise = fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: 'owfn-token-info', method: 'getAsset',
                params: { id: mintAddress, displayOptions: { showFungible: true } },
            }),
        });

        const pairsPromise = fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: 'owfn-token-pairs',
                method: 'getFungibleTokenRating', params: { mint: mintAddress },
            }),
        });
        
        const [assetRes, pairsRes] = await Promise.all([assetPromise, pairsPromise]);


        if (!assetRes.ok) {
            throw new Error(`Helius getAsset API Error: ${await assetRes.text()}`);
        }
        
        const assetJson = await assetRes.json();
        const asset = assetJson.result;

        if (!asset) {
            return res.status(404).json({ error: `No data found for mint: ${mintAddress}.` });
        }
        
        const priceInfo = asset.token_info?.price_info || {};
        const price = priceInfo.price_per_token || 0;
        const price24hChange = priceInfo.price_change_24hr || 0;
        const volume24h = priceInfo.volume_24hr || 0;
        
        const ownership = asset.ownership || {};
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const authorities = asset.authorities || [];
        const tokenInfo = asset.token_info || {};
        const supply = tokenInfo.supply ? BigInt(tokenInfo.supply) : 0n;
        const decimals = tokenInfo.decimals ?? 0;
        const totalSupply = Number(supply) / (10 ** decimals);
        const circulatingSupply = tokenInfo.circulating_supply ? Number(tokenInfo.circulating_supply) / (10 ** decimals) : totalSupply;

        const responseData: TokenDetails = {
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || `${asset.id.slice(0, 4)}...`,
            logo: links.image || null,
            description: metadata.description || undefined,
            links: {
                website: links.website || null,
                twitter: links.twitter || null,
                telegram: links.telegram || null,
                discord: links.discord || null,
            },
            pricePerToken: price,
            price24hChange: price24hChange,
            decimals: decimals,
            totalSupply: totalSupply,
            circulatingSupply: circulatingSupply,
            holders: ownership.owner_count || 0,
            marketCap: price * circulatingSupply,
            creatorAddress: asset.grouping?.find((g: any) => g.group_key === 'collection')?.group_value || asset.creators?.[0]?.address,
            createdAt: asset.created_at,
            mintAuthority: authorities.find((auth: any) => auth.scopes?.includes('mint'))?.address || null,
            freezeAuthority: authorities.find((auth: any) => auth.scopes?.includes('freeze'))?.address || null,
            updateAuthority: authorities.find((auth: any) => auth.scopes?.includes('metadata_write'))?.address || null,
            tokenStandard: asset.interface === 'FungibleToken' ? 'SPL Token' : (asset.interface === 'FungibleAsset' ? 'Token-2022' : asset.interface),
            extensions: asset.spl_token_2022_info?.extensions?.map((ext: any) => ({ extension: ext.extension, state: ext.state })) || [],
            volume24h: volume24h,
            liquidityPools: [],
        };
        
        if (pairsRes.ok) {
            const pairsJson = await pairsRes.json();
            const markets = pairsJson.result?.markets;
            if (Array.isArray(markets)) {
                responseData.liquidityPools = markets.map((market: any) => {
                    const dex = getDexInfo(market.program_id, market.address);
                    return { exchange: dex.name, lpMintAddress: market.address, url: dex.url };
                });
            }
        } else {
            console.warn(`Helius pairs API failed with status ${pairsRes.status}.`);
        }
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}