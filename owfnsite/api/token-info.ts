import type { TokenDetails } from '../types.ts';

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const mintAddress = url.searchParams.get('mint');

    if (!mintAddress) {
        return new Response(JSON.stringify({ error: "Mint address is required" }), {
            status: 400, headers: { 'Content-Type': 'application/json' },
        });
    }

    const HELIUS_API_KEY = process.env.API_KEY;
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
            throw new Error(`Helius API returned status ${response.status}`);
        }
        
        const heliusResponse = await response.json().catch(() => {
            throw new Error('Failed to parse Helius API response.');
        });
        
        const asset = heliusResponse?.result;
        
        if (!asset || !asset.id) {
            throw new Error(`Token mint not found or invalid response from Helius.`);
        }
        
        // **DEFINITIVE FIX**: Use optional chaining for all nested property access
        const content = asset?.content;
        const tokenInfo = asset?.token_info;
        const authorities = asset?.authorities;
        const ownership = asset?.ownership;
        const splTokenInfo = asset?.spl_token_info;

        const name = content?.metadata?.name ?? 'Unknown Token';
        const symbol = content?.metadata?.symbol ?? 'N/A';
        const logo = content?.links?.image ?? null;
        const decimals = tokenInfo?.decimals ?? 0;
        
        const creatorAddress = authorities?.find((a: any) => a?.scopes?.includes('owner'))?.address 
            || authorities?.[0]?.address
            || ownership?.owner 
            || 'Unknown';

        const updateAuthority = asset.compression?.compressed === false
            ? authorities?.find((a: any) => a?.scopes?.includes('metaplex_metadata_update'))?.address ?? null
            : null;
            
        const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const tokenStandard = ownership?.program === TOKEN_2022_PROGRAM_ID ? 'Token-2022' : 'SPL Token';
        
        let totalSupply: number = 0;
        const supplyRaw = tokenInfo?.supply;
        
        if (supplyRaw != null) {
            const supplyString = String(supplyRaw);
            if (/^\d+$/.test(supplyString) && supplyString.length > 0) {
                try {
                    const supplyBigInt = BigInt(supplyString);
                    const divisor = 10n ** BigInt(decimals);
                    if (divisor > 0n) {
                         const wholePart = supplyBigInt / divisor;
                         const fractionalPart = supplyBigInt % divisor;
                         const fractionalString = fractionalPart.toString().padStart(decimals, '0');
                         totalSupply = parseFloat(`${wholePart}.${fractionalString}`);
                    } else {
                         totalSupply = Number(supplyBigInt);
                    }
                } catch (e) {
                    console.error(`CRASH prevented during totalSupply calculation for mint ${mintAddress}. Supply: "${supplyString}", Decimals: ${decimals}. Error: ${e instanceof Error ? e.message : String(e)}`);
                    totalSupply = 0;
                }
            } else {
                 totalSupply = 0;
            }
        }

        const tokenExtensionsRaw = splTokenInfo?.token_extensions;
        const tokenExtensions = (Array.isArray(tokenExtensionsRaw) ? tokenExtensionsRaw : []).map((ext: any) => {
            if (!ext || typeof ext !== 'object') return null;
            return {
                extension: ext.extension || 'unknownExtension',
                state: {
                    ...(ext.state || {}),
                    mintDecimals: decimals,
                },
            };
        }).filter(Boolean);

        const responseData: Partial<TokenDetails> = {
            mintAddress: asset.id,
            name,
            symbol,
            logo,
            decimals,
            totalSupply,
            creatorAddress,
            mintAuthority: tokenInfo?.mint_authority ?? null,
            freezeAuthority: tokenInfo?.freeze_authority ?? null,
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