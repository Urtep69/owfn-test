// This server-side function securely fetches multiple token prices.
// It previously used Birdeye, but now uses the public Jupiter Price API.

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Safer access to body parameter to prevent crashes
        const mints = req.body?.mints;
        if (!Array.isArray(mints) || mints.length === 0) {
            return res.status(400).json({ error: 'An array of mint addresses is required.' });
        }
        
        // Use Jupiter's public price API as a replacement for Birdeye.
        const mintList = mints.join(',');
        const url = `https://price.jup.ag/v4/price?ids=${mintList}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Jupiter Price API error (status ${response.status}):`, errorBody);
            throw new Error(`Failed to fetch prices from Jupiter API. Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Transform the data to the format expected by the frontend hook: { [mintAddress]: { value: price } }
        const formattedData: { [key: string]: { value: number } } = {};
        if (data && data.data) {
            for (const mintAddress in data.data) {
                if (Object.prototype.hasOwnProperty.call(data.data, mintAddress)) {
                    const priceInfo = data.data[mintAddress];
                    if (priceInfo && typeof priceInfo.price === 'number') {
                        formattedData[mintAddress] = { value: priceInfo.price };
                    }
                }
            }
        }
        
        return res.status(200).json(formattedData);

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: errorMessage });
    }
}
