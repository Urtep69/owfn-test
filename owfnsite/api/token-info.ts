
export default async function handler(request: Request) {
    const url = new URL(request.url);
    const mintAddress = url.searchParams.get('mint');

    if (!mintAddress) {
        return new Response(JSON.stringify({ error: "Mint address is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // Use the generic API_KEY from env, assuming it's the Helius one for this context
    const HELIUS_API_KEY = process.env.API_KEY || process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        return new Response(JSON.stringify({ error: "Server configuration error: Missing API Key." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

        const heliusPromise = fetch(heliusUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 'my-id', method: 'getAsset', params: { id: mintAddress } }),
        }).then(res => res.json());

        const dexscreenerPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`).then(res => res.ok ? res.json() : null);
        
        const jupiterPromise = fetch(`https://price.jup.ag/v4/price?ids=SOL`).then(res => res.json());

        const [heliusData, dexscreenerData, jupiterData] = await Promise.all([heliusPromise, dexscreenerPromise, jupiterPromise]);
        
        const asset = heliusData.result;
        if (!asset) {
            throw new Error("Could not fetch asset metadata from Helius.");
        }

        const bestPair = dexscreenerData?.pairs
            ?.filter((p: any) => p.liquidity && p.liquidity.usd > 1000)
            .sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0] ?? null;

        const solPrice = jupiterData?.data?.SOL?.price ?? 0;
        const priceUsd = bestPair?.priceUsd ? parseFloat(bestPair.priceUsd) : 0;
        
        const totalSupply = asset.token_info?.supply ? parseInt(asset.token_info.supply) / (10 ** (asset.token_info.decimals ?? 0)) : 0;
        
        const marketCap = bestPair?.fdv ?? 0;

        const tokenData = {
            mintAddress: asset.id,
            name: asset.content?.metadata?.name || 'Unknown Token',
            symbol: asset.content?.metadata?.symbol || 'N/A',
            logo: asset.content?.links?.image,
            decimals: asset.token_info?.decimals ?? 0,
            pricePerToken: priceUsd,
            priceSol: priceUsd > 0 && solPrice > 0 ? priceUsd / solPrice : 0,
            price24hChange: bestPair?.priceChange?.h24 ?? 0,
            priceChange: {
                h1: bestPair?.priceChange?.h1,
                h6: bestPair?.priceChange?.h6,
            },
            volume24h: bestPair?.volume?.h24 ?? 0,
            liquidity: bestPair?.liquidity?.usd ?? 0,
            marketCap: marketCap,
            fdv: bestPair?.fdv ?? 0,
            totalSupply: totalSupply,
            pairAddress: bestPair?.pairAddress,
            dexId: bestPair?.dexId,
            deployerAddress: asset.authorities?.find((a: any) => a.type === 'creator')?.address,
            txns: bestPair?.txns,
            audit: {
                isMintable: !!asset.token_info?.mint_authority,
                isFreezable: !!asset.token_info?.freeze_authority,
            },
        };

        return new Response(JSON.stringify(tokenData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Token Info API error:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch token data from upstream services." }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
