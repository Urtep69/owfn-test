// This server-side function securely fetches multiple token prices and basic metadata.
// It uses the public Birdeye multi_price API for efficiency.

const isValidSolanaAddress = (address: any): boolean => {
    if (typeof address !== 'string') return false;
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const mints = req.body?.mints;
        if (!Array.isArray(mints) || mints.length === 0) {
            return res.status(400).json({ error: 'An array of mint addresses is required.' });
        }
        
        const validMints = mints.filter(isValidSolanaAddress);
        if (validMints.length === 0) {
            return res.status(200).json({});
        }
        
        const mintList = validMints.join(',');
        const url = `https://public-api.birdeye.so/defi/multi_price?list_token=${mintList}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Birdeye multi_price API error (status ${response.status}):`, errorBody);
            throw new Error(`Failed to fetch prices from Birdeye API. Status: ${response.status}`);
        }

        const data = await response.json();
        
        const formattedData: { [key: string]: { price: number, name: string, symbol: string, logoURI: string, decimals: number } } = {};
        if (data && data.data) {
             for (const mintAddress in data.data) {
                if (Object.prototype.hasOwnProperty.call(data.data, mintAddress)) {
                    const tokenData = data.data[mintAddress];
                    if (tokenData) {
                        formattedData[mintAddress] = {
                            price: tokenData.value,
                            name: tokenData.name,
                            symbol: tokenData.symbol,
                            logoURI: tokenData.logoURI,
                            decimals: tokenData.decimals,
                        };
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