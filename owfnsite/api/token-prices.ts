// This server-side function fetches multiple token prices and metadata using the Birdeye API.
// It is more reliable and efficient than making separate calls for metadata and prices.
// This uses the public Birdeye API endpoint.

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { mints } = req.body;
        if (!Array.isArray(mints) || mints.length === 0) {
            return res.status(400).json({ error: 'An array of mint addresses is required.' });
        }

        const url = `https://public-api.birdeye.so/defi/multi_price?list_address=${mints.join(',')}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Birdeye multi_price API failed with status ${response.status}:`, errorText);
            // Return an empty object to avoid breaking the client, but log the error.
            // The client will show "Unknown Token" but won't crash.
            return res.status(200).json({});
        }

        const data = await response.json();
        const finalData: { [key: string]: any } = {};

        if (data.success && data.data) {
            for (const mint in data.data) {
                const tokenData = data.data[mint];
                finalData[mint] = {
                    price: tokenData.value || 0,
                    name: tokenData.name || 'Unknown Token',
                    symbol: tokenData.symbol || `${mint.slice(0, 4)}...`,
                    logoURI: tokenData.logoURI || null,
                    // Provide a sensible default for decimals if it's missing
                    decimals: tokenData.decimals === undefined ? 9 : tokenData.decimals,
                };
            }
        }
        
        return res.status(200).json(finalData);

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}