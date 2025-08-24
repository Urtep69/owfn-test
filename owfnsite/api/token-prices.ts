// This server-side function fetches token metadata and prices from the Birdeye API.
// It uses a single, comprehensive endpoint to retrieve price, name, symbol, and logo,
// providing better coverage and reliability than separate data sources.

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

        const apiUrl = `https://public-api.birdeye.so/defi/multi_price?list_address=${uniqueMints.join(',')}&include_platform_data=true`;
        
        const response = await fetch(apiUrl, {
            headers: { 'x-chain': 'solana' }
        });
        
        if (!response.ok) {
            // Log the error and try to return a graceful empty response
            console.error(`Birdeye API failed with status ${response.status}: ${await response.text()}`);
            // Return an empty object so the frontend can handle it without crashing.
            return res.status(200).json({});
        }
        
        const birdeyeData = await response.json();
        
        if (!birdeyeData.success || !birdeyeData.data) {
             console.warn("Birdeye API call was not successful or returned no data.", birdeyeData);
             return res.status(200).json({});
        }

        const finalData: { [key: string]: any } = {};
        
        for (const mint of uniqueMints) {
            const tokenData = birdeyeData.data[mint];
            if (tokenData) {
                // Find the platform data, preferring one that isn't just a generic name
                const platformData = tokenData.platforms?.find((p: any) => p.name && !p.name.toLowerCase().includes('unknown')) || tokenData.platforms?.[0];

                finalData[mint] = {
                    price: tokenData.value || 0,
                    name: platformData?.name || 'Unknown Token',
                    symbol: platformData?.symbol || `${mint.slice(0, 4)}...`,
                    logoURI: platformData?.logoURI || null,
                    decimals: platformData?.decimals ?? 9, // Fallback decimals
                };
            }
        }
        
        return res.status(200).json(finalData);

    } catch (error) {
        console.error("Error in token-prices handler:", error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}
