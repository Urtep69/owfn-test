
import type { TokenDetails } from '../types.ts';

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const mintAddress = url.searchParams.get('mint');

    if (!mintAddress) {
        return new Response(JSON.stringify({ error: "Mint address is required" }), {
            status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    const HELIUS_API_KEY = process.env.API_KEY || process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        return new Response(JSON.stringify({ error: "Server configuration error: Missing API Key." }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
        const response = await fetch(heliusUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAsset',
                params: { id: mintAddress, displayOptions: { showFungible: true } },
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch on-chain data from Helius.`);
        }
        
        const heliusResponse = await response.json().catch(() => {
            throw new Error('Failed to parse Helius API response.');
        });
        
        const asset = heliusResponse?.result;
        if (!asset) {
            throw new Error(`Token mint not found on-chain via Helius.`);
        }
        
        // Safely access potentially missing nested objects
        const tokenInfo = asset.token_info || {};
        const authorities = Array.isArray(asset.authorities) ? asset.authorities : [];
        const ownership = asset.ownership || {};
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};

        const creatorAddress = authorities.find((a: any) => a.scopes?.includes('owner'))?.address 
            || (authorities.length > 0 ? authorities[0].address : null) 
            || ownership.owner 
            || 'Unknown';

        const updateAuthority = !asset.compression?.compressed 
            ? authorities.find((a: any) => a.scopes?.includes('metaplex_metadata_update'))?.address || null
            : null;
            
        const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const tokenStandard = ownership.program === TOKEN_2022_PROGRAM_ID ? 'Token-2022' : 'SPL Token';
        
        const decimals = tokenInfo.decimals ?? 0;
        let totalSupply = 0;
        if (tokenInfo.supply != null) {
            try {
                // Ensure supply is treated as a string to handle scientific notation or large numbers
                const supplyString = String(tokenInfo.supply);
                // Use BigInt for precision with large supply numbers
                totalSupply = Number(BigInt(supplyString)) / (10 ** decimals);
            } catch (e) {
                console.warn(`Could not parse supply "${tokenInfo.supply}" for mint ${mintAddress}.`);
                totalSupply = 0;
            }
        }

        const tokenExtensionsRaw = asset.spl_token_info?.token_extensions;
        const tokenExtensions = (Array.isArray(tokenExtensionsRaw) ? tokenExtensionsRaw : []).map((ext: any) => ({
            ...ext,
            state: {
                ...(ext.state || {}),
                mintDecimals: decimals,
            },
        }));

        const responseData: Partial<TokenDetails> = {
            // Base Info from Token interface
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || 'N/A',
            logo: links.image,
            decimals: decimals,
            
            // On-chain technical details
            totalSupply,
            creatorAddress,
            mintAuthority: tokenInfo.mint_authority || null,
            freezeAuthority: tokenInfo.freeze_authority || null,
            updateAuthority,
            tokenStandard,
            tokenExtensions,
        };

        return new Response(JSON.stringify(responseData), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`Token Info API error for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return new Response(JSON.stringify({ error: `Failed to fetch token data. Reason: ${errorMessage}` }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }
}
