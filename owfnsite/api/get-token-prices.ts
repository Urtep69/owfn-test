
export default async function handler(req: any, res: any) {
    const { mints } = req.query;

    if (!mints || typeof mints !== 'string') {
        return res.status(400).json({ error: "A comma-separated string of mint addresses is required." });
    }

    // Basic input sanitation
    const sanitizedMints = mints.split(',').map(m => m.trim()).filter(Boolean).join(',');
    if (!sanitizedMints) {
        return res.status(400).json({ error: "No valid mint addresses provided." });
    }

    const JUPITER_API_URL = `https://price.jup.ag/v4/price?ids=${sanitizedMints}`;

    try {
        const response = await fetch(JUPITER_API_URL);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Jupiter Price API Error: ${response.status}`, errorText);
            return res.status(response.status).json({ error: `Upstream price service failed: ${errorText}` });
        }

        const data = await response.json();
        
        // Add cache control headers for Vercel's edge network
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
        
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error in /api/get-token-prices proxy:", error);
        return res.status(500).json({ error: "Internal server error while fetching token prices." });
    }
}
