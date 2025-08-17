export default async function handler(req: any, res: any) {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ error: "Wallet address is required" });
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        console.error("Helius API key is not configured.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAssetsByOwner',
                params: {
                    ownerAddress: address,
                    page: 1,
                    limit: 1000,
                    displayOptions: {
                        showFungible: true,
                        showNativeBalance: true,
                    },
                },
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Helius API Error:', errorText);
            throw new Error(`Failed to fetch assets from Helius: ${response.statusText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error(`Error fetching wallet assets for ${address}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return res.status(500).json({ error: errorMessage });
    }
}
