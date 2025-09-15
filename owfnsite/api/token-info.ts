import type { TokenDetails } from '../lib/types.js';
import { MOCK_TOKEN_DETAILS } from '../lib/constants.js';

const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

function calculateMarketCap(price: number, supply: number): number {
    if (!price || !supply) return 0;
    return price * supply;
}

// In a real-world scenario, this data would come from a dedicated market data indexer API (e.g., Jupiter, Birdeye).
// For this implementation, we are mocking this data to build the UI as requested.
const getMockMarketData = async (mint: string) => {
    // Seed the random number generator for consistent mock data per mint
    const seed = mint.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => min + (seed % 1000 / 1000) * (max - min);

    return {
        liquidity: random(150000, 200000),
        volume24h: random(800000, 1000000),
        holders: Math.floor(random(1000, 1500)),
        txns: { h24: { buys: Math.floor(random(500, 700)), sells: Math.floor(random(450, 650)) } },
        price24hChange: (random(0, 20) - 10), // -10% to +10%
        pairAddress: '7r2S6Tvz7mX47dBbzsXir334kaJCQfcd6Vhv3T3q8pTu', // Mock pair address from Dextools example
        poolInfo: {
            baseToken: { address: mint, amount: random(200000000, 220000000) },
            quoteToken: { address: 'So11111111111111111111111111111111111111112', amount: random(1200, 1300) }
        }
    };
};


export default async function handler(req: any, res: any) {
    const mintAddress = req.query?.mint;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }
    
    if (!process.env.HELIUS_API_KEY) {
        console.error("Helius API key is not configured.");
        return res.status(500).json({ error: "Server configuration error for Helius API." });
    }

    try {
        const response = await fetch(HELIUS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'owfn-token-info',
                method: 'getAsset',
                params: {
                    id: mintAddress,
                },
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Helius API error for getAsset: ${response.status}`, errorText);
            return res.status(response.status).json({ error: `Helius API Error: ${errorText}` });
        }
        
        const jsonResponse = await response.json();

        if (jsonResponse.error) {
            console.error(`Helius API returned an error object for getAsset`, jsonResponse.error);
            return res.status(400).json({ error: `Helius Error: ${jsonResponse.error.message}` });
        }
        
        const asset = jsonResponse.result;
        
        if (!asset) {
            return res.status(404).json({ error: `No data could be found for mint: ${mintAddress}.` });
        }
        
        const tokenInfo = asset.token_info || {};
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const priceInfo = tokenInfo.price_info || {};

        const decimals = tokenInfo.decimals ?? 9;
        const price = priceInfo.price_per_token || 0;
        const supply = tokenInfo.supply ? Number(BigInt(tokenInfo.supply)) / (10 ** decimals) : 0;
        
        let mintAuthority: string | null = null;
        let freezeAuthority: string | null = null;
        let updateAuthority: string | null = null;

        if (Array.isArray(asset.authorities)) {
             for (const authority of asset.authorities) {
                if (authority && typeof authority === 'object' && Array.isArray(authority.scopes)) {
                    if (authority.scopes.includes('mint')) mintAuthority = authority.address;
                    if (authority.scopes.includes('freeze')) freezeAuthority = authority.address;
                    if (authority.scopes.includes('update')) updateAuthority = authority.address;
                }
            }
        }
        
        const marketData = await getMockMarketData(mintAddress);

        const responseData: TokenDetails = {
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || `${asset.id.slice(0, 4)}...`,
            logo: links.image || null,
            decimals: decimals,
            pricePerToken: price,
            totalSupply: supply,
            
            mintAuthority: mintAuthority,
            freezeAuthority: freezeAuthority,
            updateAuthority: updateAuthority,
            tokenStandard: asset.interface === 'FungibleToken' ? 'SPL Token' : (asset.interface === 'FungibleAsset' ? 'Token-2022' : asset.interface),
            
            // Merged market data
            ...marketData,
            fdv: calculateMarketCap(price, supply),
            marketCap: calculateMarketCap(price, tokenInfo.circulating_supply ? (Number(BigInt(tokenInfo.circulating_supply)) / (10 ** decimals)) : supply),
            
            // Other fields from type
            balance: 0,
            usdValue: 0,
        };

        const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
        if (mockDetailsKey) {
            responseData.description = MOCK_TOKEN_DETAILS[mockDetailsKey].description;
        }
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}