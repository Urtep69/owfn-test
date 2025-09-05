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
        const [assetResponse, jupResponse] = await Promise.all([
             fetch(HELIUS_API_URL, {
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
            }),
            fetch(`https://token.jup.ag/v6/token-info?address=${mintAddress}`)
        ]);

        if (!assetResponse.ok) {
            const errorText = await assetResponse.text();
            console.error(`Helius API error for getAsset: ${assetResponse.status}`, errorText);
            return res.status(assetResponse.status).json({ error: `Helius API Error: ${errorText}` });
        }
        
        const jsonResponse = await assetResponse.json();

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
        const fungibleInfo = asset.fungible_info || {};
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        
        let jupData: any = {};
        if (jupResponse.ok) {
            jupData = await jupResponse.json();
        } else {
            console.warn(`Jupiter API failed for mint ${mintAddress} with status ${jupResponse.status}`);
        }
        
        const price = jupData.price || 0;
        const decimals = tokenInfo.decimals ?? 9;
        const supply = fungibleInfo.supply ? Number(BigInt(fungibleInfo.supply)) / (10 ** decimals) : 0;
        
        const mintAuthority: string | null = fungibleInfo.mint_authority || null;
        const freezeAuthority: string | null = fungibleInfo.freeze_authority || null;
        const updateAuthority: string | null = (asset.authorities || []).find((a: any) => a.scopes.includes('update'))?.address || null;


        const responseData: Partial<TokenDetails> = {
            mintAddress: asset.id,
            name: metadata.name || jupData.name || 'Unknown Token',
            symbol: metadata.symbol || jupData.symbol || `${asset.id.slice(0, 4)}...`,
            logo: content.links?.image || jupData.logoURI || null,
            decimals: decimals,
            pricePerToken: price,
            totalSupply: supply,
            marketCap: calculateMarketCap(price, supply),
            fdv: jupData.tags?.includes('raydium') ? jupData.fdv : calculateMarketCap(price, supply), // Use Jup FDV if available, else calculate
            volume24h: jupData.volume24h,

            mintAuthority: mintAuthority,
            freezeAuthority: freezeAuthority,
            updateAuthority: updateAuthority,
            tokenStandard: asset.interface === 'FungibleToken' ? 'SPL Token' : (asset.interface === 'FungibleAsset' ? 'Token-2022' : asset.interface),
        };

        // Populate description from mock if available
        const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
        if (mockDetailsKey) {
            responseData.description = MOCK_TOKEN_DETAILS[mockDetailsKey].description;
        } else if (metadata.description) {
            responseData.description = metadata.description;
        }
        
        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        return res.status(500).json({ error: "An unexpected server error occurred." });
    }
}