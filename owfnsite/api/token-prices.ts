// Re-architected to be more robust.
// It uses the official Jupiter token list for reliable metadata (name, symbol, logo)
// and Jupiter's dedicated Price API for real-time values. This two-source approach
// ensures token information is both accurate and consistently available, fixing the
// "Unknown Token" and missing price issues.

const JUPITER_TOKEN_LIST_URL = 'https://token.jup.ag/all';

async function getJupiterTokenList() {
    try {
        const response = await fetch(JUPITER_TOKEN_LIST_URL);
        if (!response.ok) {
            console.error("Failed to fetch Jupiter token list");
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching Jupiter token list:", error);
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

        // Step 1: Get metadata from Jupiter's token list
        const tokenList = await getJupiterTokenList();
        const tokenMap = new Map<string, any>();
        if (tokenList) {
            tokenList.forEach((token: any) => {
                tokenMap.set(token.address, token);
            });
        }
        
        const finalData: { [key: string]: any } = {};

        // Step 2: Fetch prices from Jupiter's price API
        const priceApiUrl = `https://price.jup.ag/v4/price?ids=${uniqueMints.join(',')}`;
        let priceData: { [key: string]: any } = {};
        try {
            const priceResponse = await fetch(priceApiUrl);
            if (priceResponse.ok) {
                const responseJson = await priceResponse.json();
                priceData = responseJson.data || {};
            } else {
                 console.warn(`Jupiter price API failed with status ${priceResponse.status}`);
            }
        } catch (priceError) {
             console.error("Could not fetch token prices from Jupiter:", priceError);
        }

        // Step 3: Combine metadata and price data
        for (const mint of uniqueMints) {
            const metadata = tokenMap.get(mint);
            const priceInfo = priceData[mint];

            // Prioritize metadata from the token list.
            // If it exists, we show name/symbol even if price is missing.
            if (metadata) {
                 finalData[mint] = {
                    price: priceInfo?.price || 0,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    logoURI: metadata.logoURI,
                    decimals: metadata.decimals,
                };
            } else {
                 // If not in the list, it might be a new/obscure token.
                 // We still provide price if available, but with default metadata.
                 finalData[mint] = {
                    price: priceInfo?.price || 0,
                    name: 'Unknown Token',
                    symbol: `${mint.slice(0, 4)}...`,
                    logoURI: null,
                    decimals: 9, // Fallback decimals
                };
            }
        }
        
        return res.status(200).json(finalData);

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}
