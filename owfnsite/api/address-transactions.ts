export default async function handler(req: any, res: any) {
    const { address, before } = req.query;

    if (!address) {
        return res.status(400).json({ error: "Address is required" });
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        console.error("Helius API key is not configured.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        let url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}`;
        if (before) {
            url += `&before=${before}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Helius API Error:', errorText);
            throw new Error(`Failed to fetch transactions from Helius: ${response.statusText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error(`Error fetching transactions for ${address}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return res.status(500).json({ error: errorMessage });
    }
}
