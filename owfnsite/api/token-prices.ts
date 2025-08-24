// This server-side function fetches multiple token prices and metadata using reliable sources.
// It uses the Jupiter token list for metadata and the Jupiter Price API for prices.

// Cache for the token list to avoid re-fetching on every request
let tokenListCache: any[] | null = null;
let cacheTimestamp: number = 0;
const TOKEN_LIST_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const getTokenList = async () => {
    if (tokenListCache && (Date.now() - cacheTimestamp < TOKEN_LIST_CACHE_DURATION)) {
        return tokenListCache;
    }
    try {
        const response = await fetch('https://token.jup.ag/all');
        if (!response.ok) {
            console.error("Failed to fetch Jupiter token list, status:", response.status);
            return tokenListCache; // Return old cache if available
        }
        const data = await response.json();
        tokenListCache = data;
        cacheTimestamp = Date.now();
        return tokenListCache;
    } catch (error) {
        console.error("Error fetching Jupiter token list:", error);
        return tokenListCache; // Return old cache on error
    }
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const mints = req.body?.mints;
        if (!Array.isArray(mints) || mints.length === 0) {
            return res.status(400).json({ error: 'An array of mint addresses is required.' });
        }
        
        const tokenList = await getTokenList();
        const tokenMap = new Map(tokenList?.map(token => [token.address, token]));
        const finalData: { [key: string]: any } = {};

        // 1. Populate metadata from the cached token list for high reliability
        mints.forEach(mint => {
            const tokenInfo = tokenMap.get(mint);
            if (tokenInfo) {
                finalData[mint] = {
                    price: 0, // Default price, to be updated
                    name: tokenInfo.name,
                    symbol: tokenInfo.symbol,
                    logoURI: tokenInfo.logoURI,
                    decimals: tokenInfo.decimals,
                };
            } else {
                // Fallback for tokens not in the extensive Jupiter list
                finalData[mint] = {
                    price: 0,
                    name: 'Unknown Token',
                    symbol: `${mint.slice(0, 4)}...`,
                    logoURI: null,
                    decimals: 9, // A common default, but may be inaccurate
                };
            }
        });

        // 2. Batch fetch all prices from Jupiter's dedicated price API
        try {
            const priceUrl = `https://price.jup.ag/v4/price?ids=${mints.join(',')}`;
            const priceResponse = await fetch(priceUrl);
            if (priceResponse.ok) {
                const priceData = await priceResponse.json();
                if (priceData.data) {
                    for (const mintAddress in priceData.data) {
                        if (finalData[mintAddress]) {
                            finalData[mintAddress].price = priceData.data[mintAddress].price;
                        }
                    }
                }
            } else {
                console.warn(`Jupiter price API failed with status ${priceResponse.status}`);
            }
        } catch (priceError) {
            console.error("Error fetching prices from Jupiter:", priceError);
            // In case of error, metadata will still be returned with a price of 0.
        }

        return res.status(200).json(finalData);

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: errorMessage });
    }
}