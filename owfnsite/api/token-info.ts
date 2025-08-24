import type { TokenDetails } from '../types.ts';
import { MOCK_TOKEN_DETAILS } from '../constants.ts';

const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

function calculateMarketCap(price: number, supply: number): number {
    if (!price || !supply) return 0;
    return price * supply;
}

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
        const asset = jsonResponse.result;
        
        if (!asset) {
            return res.status(404).json({ error: `No data could be found for mint: ${mintAddress}.` });
        }

        const decimals = asset.token_info?.decimals ?? 9;
        const price = asset.token_info?.price_info?.price_per_token || 0;
        const supply = asset.token_info?.supply ? Number(BigInt(asset.token_info.supply)) / (10 ** decimals) : 0;
        
        // Safely extract authorities by checking if 'authorities' is an array
        // and correctly checking the 'scopes' array for permissions.
        let mintAuthority: string | null = null;
        let freezeAuthority: string | null = null;
        if (Array.isArray(asset.authorities)) {
            mintAuthority = asset.authorities.find((a: any) => Array.isArray(a.scopes) && a.scopes.includes('mint'))?.address ?? null;
            freezeAuthority = asset.authorities.find((a: any) => Array.isArray(a.scopes) && a.scopes.includes('freeze'))?.address ?? null;
        }

        const responseData: Partial<TokenDetails> = {
            mintAddress: asset.id,
            name: asset.content?.metadata?.name || 'Unknown Token',
            symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}...`,
            logo: asset.content?.links?.image || null,
            decimals: decimals,
            pricePerToken: price,
            totalSupply: supply,
            marketCap: calculateMarketCap(price, supply),
            
            mintAuthority: mintAuthority,
            freezeAuthority: freezeAuthority,
            updateAuthority: null, // This is not reliably provided for fungible tokens via this endpoint.
            tokenStandard: asset.interface === 'FungibleToken' ? 'SPL Token' : (asset.interface === 'FungibleAsset' ? 'Token-2022' : asset.interface),
        };

        // Populate description from mock if available
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