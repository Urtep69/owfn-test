
export default async function handler(req: any, res: any) {
    const { address, before } = req.query;

    if (!address) {
        return res.status(400).json({ error: "Address is required" });
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        console.error("Server configuration error: Missing Helius API Key.");
        return res.status(500).json({ error: "Server configuration error." });
    }
    
    const HELIUS_API_BASE_URL = 'https://api.helius.xyz';
    
    // Updated to v0 as requested by the user. Note: Helius recommends migrating to v1.
    let url = `${HELIUS_API_BASE_URL}/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}`;
    if (before) {
        url += `&before=${before}`;
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Helius API Error for get-address-transactions: ${response.status}`, errorText);
            return res.status(response.status).json({ error: `Failed to fetch transactions from Helius: ${errorText}` });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error in /api/get-address-transactions:", error);
        return res.status(500).json({ error: "Internal server error while fetching address transactions." });
    }
}