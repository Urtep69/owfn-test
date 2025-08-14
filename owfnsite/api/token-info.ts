
import type { TokenDetails } from '../types.ts';

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const mintAddress = url.searchParams.get('mint');

    if (!mintAddress) {
        return new Response(JSON.stringify({ error: "Mint address is required" }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const HELIUS_API_KEY = process.env.API_KEY || process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        return new Response(JSON.stringify({ error: "Server configuration error: Missing API Key." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

        // Fetch all data sources concurrently for performance
        const [heliusResult, dexscreenerResult, solscanResult] = await Promise.allSettled([
            fetch(heliusUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'my-id',
                    method: 'getAsset',
                    params: { id: mintAddress, displayOptions: { showFungible: true } },
                }),
            }),
            fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`),
            fetch(`https://api.solscan.io/v2/token/holders?token=${mintAddress}&offset=0&size=0`)
        ]);

        // --- Process Helius Data (Primary source for on-chain truth) ---
        if (heliusResult.status === 'rejected' || !heliusResult.value.ok) {
            throw new Error(`Failed to fetch on-chain data from Helius.`);
        }
        // Safely parse JSON
        const heliusResponse = await heliusResult.value.json().catch(() => {
            throw new Error('Failed to parse Helius API response.');
        });
        const asset = heliusResponse?.result;

        if (!asset) {
            throw new Error(`Token mint not found on-chain via Helius.`);
        }
        
        const tokenInfo = asset.token_info;
        const authorities = asset.authorities || [];
        const ownership = asset.ownership;
        const content = asset.content;
        
        const creatorAddress = authorities.find((a: any) => a.scopes?.includes('owner'))?.address || authorities[0]?.address || 'Unknown';
        const updateAuthority = !asset.compression?.compressed 
            ? authorities.find((a: any) => a.scopes?.includes('metaplex_metadata_update'))?.address || null
            : null;

        const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const tokenStandard = ownership?.owner === TOKEN_2022_PROGRAM_ID ? 'Token-2022' : 'SPL Token';
        
        let totalSupply = 0;
        const decimals = tokenInfo?.decimals ?? 0;
        if (tokenInfo && tokenInfo.supply != null) {
            try {
                // Helius supply is a u64, can be a large string.
                // It can also sometimes be returned as a float string (e.g. "1000.0").
                // BigInt requires a pure integer string, so we must sanitize it first.
                const supplyString = String(tokenInfo.supply);
                const integerString = supplyString.split('.')[0];
                totalSupply = Number(BigInt(integerString)) / (10 ** decimals);
            } catch (e) {
                console.warn(`Could not parse supply "${tokenInfo.supply}" for mint ${mintAddress}. Falling back to 0.`);
                totalSupply = 0;
            }
        }

        // --- Process Dexscreener Data (Primary source for market data) ---
        let bestPair = null;
        if (dexscreenerResult.status === 'fulfilled' && dexscreenerResult.value.ok) {
            const dexscreenerData = await dexscreenerResult.value.json().catch(() => null);
            if (dexscreenerData?.pairs) {
                 bestPair = dexscreenerData.pairs
                    ?.filter((p: any) => p?.liquidity?.usd > 1000)
                    .sort((a: any, b: any) => (b?.liquidity?.usd ?? 0) - (a?.liquidity?.usd ?? 0))[0] ?? null;
            }
        }

        // --- Process Solscan Data (For holder count) ---
        let holders = 0;
        if (solscanResult.status === 'fulfilled' && solscanResult.value.ok) {
            const solscanData = await solscanResult.value.json().catch(() => null);
            holders = solscanData?.data?.total ?? 0;
        }
        
        const priceUsd = bestPair?.priceUsd ? parseFloat(bestPair.priceUsd) : 0;
        
        const marketCap = bestPair?.fdv ?? (totalSupply > 0 && priceUsd > 0 ? totalSupply * priceUsd : 0);
        const circulatingSupply = marketCap > 0 && priceUsd > 0 ? marketCap / priceUsd : totalSupply;

        const responseData: TokenDetails = {
            // Base Info
            mintAddress: asset.id,
            name: content?.metadata?.name || 'Unknown Token',
            symbol: content?.metadata?.symbol || 'N/A',
            logo: content?.links?.image,
            decimals: decimals,
            pricePerToken: priceUsd, balance: 0, usdValue: 0, description: {}, // Placeholder fields

            // Market Data from Dexscreener
            price24hChange: bestPair?.priceChange?.h24 ?? 0,
            priceChange: bestPair?.priceChange,
            volume24h: bestPair?.volume?.h24 ?? 0,
            liquidity: bestPair?.liquidity?.usd ?? 0,
            marketCap,
            fdv: bestPair?.fdv ?? 0,
            pairAddress: bestPair?.pairAddress,
            dexId: bestPair?.dexId,
            txns: bestPair?.txns,
            
            // On-chain Data from Helius & Solscan
            totalSupply,
            circulatingSupply,
            holders,
            poolCreatedAt: bestPair?.pairCreatedAt,
            creatorAddress,
            mintAuthority: tokenInfo?.mint_authority || null,
            freezeAuthority: tokenInfo?.freeze_authority || null,
            updateAuthority,
            tokenStandard,
            tokenExtensions: (asset.spl_token_info?.token_extensions || []).map((ext: any) => ({
                ...ext,
                state: {
                    ...(ext.state || {}),
                    mintDecimals: decimals,
                },
            })),
        };

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`Token Info API error for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return new Response(JSON.stringify({ error: `Failed to fetch token data. Reason: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
