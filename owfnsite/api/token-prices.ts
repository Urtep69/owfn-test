// This server-side function fetches token metadata and prices from reliable Jupiter APIs.
// It separates metadata fetching (from the token list) and price fetching for robustness.

// A simple in-memory cache for the token list to avoid refetching on every call.
let tokenListCache: any[] | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function getTokenList() {
    if (tokenListCache && (Date.now() - lastFetchTimestamp < CACHE_TTL)) {
        return tokenListCache;
    }
    try {
        const response = await fetch('https://token.jup.ag/all');
        if (!response.ok) {
            console.error("Failed to fetch Jupiter token list");
            return tokenListCache; // Return stale cache if available
        }
        const data = await response.json();
        tokenListCache = data;
        lastFetchTimestamp = Date.now();
        return tokenListCache;
    } catch (error) {
        console.error("Error fetching Jupiter token list:", error);
        return tokenListCache; // Return stale cache if available
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

        // 1. Fetch token list and prices in parallel
        const tokenListPromise = getTokenList();
        const priceUrl = `https://price.jup.ag/v4/price?ids=${mints.join(',')}`;
        const pricePromise = fetch(priceUrl).then(resp => resp.ok ? resp.json() : null);

        const [allTokens, priceData] = await Promise.all([tokenListPromise, pricePromise]);

        const finalData: { [key: string]: any } = {};
        
        if (!allTokens) {
            console.error("Token list is unavailable, cannot proceed.");
            return res.status(503).json({ error: "Failed to retrieve token metadata list." });
        }
        
        const tokenMap = new Map(allTokens.map(token => [token.address, token]));

        // 2. Combine metadata and prices
        for (const mint of mints) {
            const metadata = tokenMap.get(mint);
            const priceInfo = priceData?.data?.[mint];
            
            if (metadata) {
                 finalData[mint] = {
                    price: priceInfo?.price || 0,
                    name: metadata.name || 'Unknown Token',
                    symbol: metadata.symbol || `${mint.slice(0, 4)}...`,
                    logoURI: metadata.logoURI || null,
                    decimals: metadata.decimals ?? 9,
                };
            } else {
                 // Fallback for tokens not in Jupiter's list (like wrapped SOL or devnet tokens)
                 // This is important for SOL itself.
                 finalData[mint] = {
                    price: priceInfo?.price || 0,
                    name: 'Unknown Token',
                    symbol: `${mint.slice(0, 4)}...`,
                    logoURI: null,
                    decimals: priceInfo?.mintDecimals ?? 9,
                 }
            }
        }
        
        // Special handling for native SOL, which isn't a mint but is requested this way often.
        const solMint = 'So11111111111111111111111111111111111111112';
        if (mints.includes(solMint) && priceData?.data?.[solMint]) {
             finalData[solMint] = {
                price: priceData.data[solMint].price || 0,
                name: 'Solana',
                symbol: 'SOL',
                logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
                decimals: 9
            };
        }

        return res.status(200).json(finalData);

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}