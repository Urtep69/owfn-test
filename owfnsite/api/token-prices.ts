// This server-side function fetches token metadata and prices from reliable Jupiter APIs.
// It prioritizes fetching metadata from the comprehensive token list to ensure token names and logos
// are always available, even if the real-time price API fails for a specific token.

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
            console.error("Failed to fetch Jupiter token list, returning stale data if available.");
            return tokenListCache; // Return stale cache if available
        }
        const data = await response.json();
        tokenListCache = data;
        lastFetchTimestamp = Date.now();
        return tokenListCache;
    } catch (error) {
        console.error("Error fetching Jupiter token list, returning stale data if available:", error);
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
        const uniqueMints = Array.from(new Set(mints));

        // 1. Fetch token list and prices in parallel for efficiency
        const tokenListPromise = getTokenList();
        const priceUrl = `https://price.jup.ag/v4/price?ids=${uniqueMints.join(',')}`;
        const pricePromise = fetch(priceUrl).then(resp => resp.ok ? resp.json() : Promise.resolve(null)).catch(() => null);

        const [allTokens, priceData] = await Promise.all([tokenListPromise, pricePromise]);

        const finalData: { [key: string]: any } = {};
        
        if (!allTokens) {
            // This is a critical failure if the token list cannot be fetched at all and cache is empty.
            console.error("Token list is unavailable, cannot provide metadata.");
            return res.status(503).json({ error: "Failed to retrieve token metadata list." });
        }
        
        // Create a map for quick lookups of token metadata.
        const tokenMap = new Map(allTokens.map(token => [token.address, token]));

        // 2. Iterate through requested mints and build the response object.
        // This ensures metadata is always present if the token exists in the list,
        // regardless of whether the price API call succeeds.
        for (const mint of uniqueMints) {
            const metadata = tokenMap.get(mint);
            const priceInfo = priceData?.data?.[mint];
            
            // Prioritize metadata from the reliable token list
            if (metadata) {
                 finalData[mint] = {
                    price: priceInfo?.price || 0, // Fallback to 0 if price is missing
                    name: metadata.name,
                    symbol: metadata.symbol,
                    logoURI: metadata.logoURI,
                    decimals: metadata.decimals,
                };
            } else {
                 // Fallback for tokens not in Jupiter's strict list (like wrapped SOL or devnet tokens)
                 finalData[mint] = {
                    price: priceInfo?.price || 0,
                    name: 'Unknown Token',
                    symbol: `${mint.slice(0, 4)}...`,
                    logoURI: null,
                    decimals: priceInfo?.mintDecimals ?? 9,
                 }
            }
        }
        
        // Special handling for native SOL to ensure its metadata is always correct.
        const solMint = 'So11111111111111111111111111111111111111112';
        if (uniqueMints.includes(solMint)) {
             finalData[solMint] = {
                price: priceData?.data?.[solMint]?.price || 0,
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