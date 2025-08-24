// Re-architected for reliability and comprehensiveness using the Birdeye API.
// This single endpoint provides price data, and we supplement it with metadata
// to ensure even new or obscure tokens are recognized correctly.

async function safeFetchJson(url: string, options?: RequestInit) {
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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { mints } = req.body;
        if (!Array.isArray(mints) || mints.length === 0) {
            return res.status(400).json({ error: 'An array of mint addresses is required.' });
        }
        const uniqueMints = Array.from(new Set(mints as string[]));

        // Use the Birdeye API, which has excellent coverage for a wide range of Solana tokens.
        const birdeyeApiUrl = `https://public-api.birdeye.so/defi/multi_price?list_address=${uniqueMints.join(',')}`;
        
        const priceDataResponse = await safeFetchJson(birdeyeApiUrl);

        const finalData: { [key: string]: any } = {};
        
        // This is a robust fallback mechanism. If Birdeye's price API fails,
        // we will still try to get metadata from Jupiter's trusted token list.
        const tokenList = await safeFetchJson('https://token.jup.ag/all');
        const tokenMap = new Map();
        if (tokenList) {
            for (const token of tokenList) {
                tokenMap.set(token.address, token);
            }
        }
        
        for (const mint of uniqueMints) {
            const priceInfo = priceDataResponse?.data?.[mint];
            const metadata = tokenMap.get(mint);
            
            finalData[mint] = {
                price: priceInfo?.value || 0,
                name: metadata?.name || 'Unknown Token',
                symbol: metadata?.symbol || `${mint.slice(0, 4)}...`,
                logoURI: metadata?.logoURI || null,
                decimals: metadata?.decimals || 9, // Fallback to 9 if unknown
            };
        }
        
        return res.status(200).json(finalData);

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}
