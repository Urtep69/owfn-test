// This is a new server-side function to securely fetch multiple token prices from Birdeye.
// The API key is used here and is never exposed to the client.

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const birdeyeApiKey = process.env.BIRDEYE_API_KEY;
    if (!birdeyeApiKey) {
        console.error("CRITICAL: BIRDEYE_API_KEY environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        const { mints } = req.body;
        if (!Array.isArray(mints) || mints.length === 0) {
            return res.status(400).json({ error: 'An array of mint addresses is required.' });
        }
        
        // Birdeye's multi_price endpoint takes a comma-separated list of addresses.
        const mintList = mints.join(',');
        const url = `https://public-api.birdeye.so/defi/multi_price?list_address=${mintList}`;

        const response = await fetch(url, {
            headers: {
                'X-API-KEY': birdeyeApiKey
            }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Birdeye API error (status ${response.status}):`, errorBody);
            throw new Error(`Failed to fetch prices from Birdeye API. Status: ${response.status}`);
        }

        const data = await response.json();
        
        // The API returns { data: { mint: { value: price } } }
        // We will return this structure directly to the client.
        return res.status(200).json(data.data || {});

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: errorMessage });
    }
}