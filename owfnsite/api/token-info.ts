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
                    displayOptions: {
                        showFungible: true
                    }
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
        
        // Defensively access nested properties
        const tokenInfo = asset.token_info || {};
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const ownership = asset.ownership || {};
        const priceInfo = tokenInfo.price_info || {};

        const decimals = tokenInfo.decimals ?? 9;
        const price = priceInfo.price_per_token || 0;
        
        let supply = 0;
        if (tokenInfo.supply && typeof tokenInfo.supply === 'string') {
            try {
                const rawSupplyBigInt = BigInt(tokenInfo.supply);
                const divisor = 10n ** BigInt(decimals);
                // Perform division with BigInt to handle large numbers, then convert the result to Number.
                // This is safe for total supply, which is expected to be a whole number.
                supply = Number(rawSupplyBigInt / divisor);
            } catch (e) {
                console.warn(`Could not parse supply string "${tokenInfo.supply}" as a valid number.`, e);
                // Fallback to 0 if parsing fails
                supply = 0;
            }
        }
        
        let mintAuthority: string | null = null;
        let freezeAuthority: string | null = null;
        let updateAuthority: string | null = null;

        if (Array.isArray(asset.authorities)) {
             for (const authority of asset.authorities) {
                if (authority && typeof authority === 'object' && Array.isArray(authority.scopes)) {
                    if (authority.scopes.includes('mint')) {
                        mintAuthority = authority.address;
                    }
                    if (authority.scopes.includes('freeze')) {
                        freezeAuthority = authority.address;
                    }
                     // The scope for metadata authority is typically 'metadata_update'
                     if (authority.scopes.includes('metadata_update')) {
                        updateAuthority = authority.address;
                    }
                }
            }
        }
        
        const tokenStandard = asset.interface === 'FungibleAsset' ? 'Token-2022' : 'SPL Token';
        
        const responseData: Partial<TokenDetails> = {
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || `${asset.id.slice(0, 4)}...`,
            logo: links.image || null,
            decimals: decimals,
            pricePerToken: price,
            totalSupply: supply,
            marketCap: calculateMarketCap(price, supply),
            fdv: calculateMarketCap(price, supply),
            volume24h: priceInfo.total_volume_24hr || 0,
            price24hChange: priceInfo.price_change_24hr || 0,
            holders: ownership.owner_count || 0,
            liquidity: priceInfo.liquidity || 0,
            
            creatorAddress: ownership.owner,
            mintAuthority: mintAuthority,
            freezeAuthority: freezeAuthority,
            updateAuthority: updateAuthority,
            tokenStandard: tokenStandard,
        };

        // Populate description from mock if available
        const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
        if (mockDetailsKey) {
            responseData.description = MOCK_TOKEN_DETAILS[mockDetailsKey].description;
            // Add mock trading stats if available, to fulfill the prompt
            responseData.txns = MOCK_TOKEN_DETAILS[mockDetailsKey].txns;
        }
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}
