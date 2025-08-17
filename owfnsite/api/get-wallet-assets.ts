
export default async function handler(req: any, res: any) {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ error: "Address is required" });
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        console.error("Server configuration error: Missing Helius API Key.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    
    try {
        const response = await fetch(HELIUS_RPC_URL, {
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
            console.error(`Helius API Error for getAssetsByOwner: ${response.status}`, errorText);
            return res.status(response.status).json({ error: `Failed to fetch assets from Helius: ${errorText}` });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Error in /api/get-wallet-assets:", error);
        return res.status(500).json({ error: "Internal server error while fetching wallet assets." });
    }
}
