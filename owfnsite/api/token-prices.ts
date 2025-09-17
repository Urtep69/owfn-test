// Re-architected for reliability and comprehensiveness using the Helius DAS API.

const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

// Define a type for the Helius asset object to fix TypeScript errors.
interface HeliusAsset {
    id: string;
    token_info?: {
        price_info?: {
            price_per_token?: number;
        };
        decimals?: number;
    };
    content?: {
        metadata?: {
            name?: string;
            symbol?: string;
        };
        links?: {
            image?: string | null;
        };
    };
}


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!process.env.HELIUS_API_KEY) {
        console.error("Helius API key is not configured.");
        return res.status(500).json({ error: "Server configuration error for Helius API." });
    }

    try {
        const { mints } = req.body;
        if (!Array.isArray(mints) || mints.length === 0) {
            return res.status(400).json({ error: 'An array of mint addresses is required.' });
        }
        const uniqueMints = Array.from(new Set(mints as string[]));

        const finalData: { [key: string]: any } = {};
        
        if (uniqueMints.length > 0) {
             const response = await fetch(HELIUS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'owfn-token-prices',
                    method: 'getAssetBatch',
                    params: {
                        ids: uniqueMints,
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Helius API error: ${response.status}`, errorText);
                // Populate with fallbacks so UI doesn't break
                for (const mint of uniqueMints) {
                    finalData[mint] = { price: 0, name: 'Unknown Token', symbol: `${mint.slice(0, 4)}...`, logoURI: null, decimals: 9 };
                }
            } else {
                const { result: assets } = await response.json();
                
                const assetMap = new Map((assets as HeliusAsset[]).map((asset) => [asset.id, asset]));

                for (const mint of uniqueMints) {
                    const asset = assetMap.get(mint);
                    if (asset) {
                        finalData[mint] = {
                            price: asset.token_info?.price_info?.price_per_token || 0,
                            name: asset.content?.metadata?.name || 'Unknown Token',
                            symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}...`,
                            logoURI: asset.content?.links?.image || null,
                            decimals: asset.token_info?.decimals ?? 9,
                        };
                    } else {
                        // Helius didn't return data for this mint, so we provide a fallback.
                        finalData[mint] = { price: 0, name: 'Unknown Token', symbol: `${mint.slice(0, 4)}...`, logoURI: null, decimals: 9 };
                    }
                }
            }
        }
        
        return res.status(200).json(finalData);

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}