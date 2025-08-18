import type { TokenDetails } from '../types.ts';
import { HELIUS_API_KEY } from '../constants.ts';

export default async function handler(req: any, res: any) {
    const { mint: mintAddress } = req.query;

    if (!mintAddress) {
        return res.status(400).json({ error: "Mint address is required" });
    }

    if (!HELIUS_API_KEY) {
        return res.status(500).json({ error: "Server configuration error: Missing Helius API Key." });
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
            const errorText = await response.text().catch(() => 'Could not retrieve error body.');
            throw new Error(`Helius API returned status ${response.status}: ${errorText}`);
        }
        
        const heliusResponse = await response.json().catch(() => {
            throw new Error('Failed to parse Helius API response. The response was not valid JSON.');
        });
        
        if (heliusResponse.error) {
            console.error(`Helius RPC Error for mint ${mintAddress}:`, heliusResponse.error);
            const rpcErrorMessage = `Helius RPC Error: ${heliusResponse.error.message} (Code: ${heliusResponse.error.code})`;
            return res.status(502).json({ error: rpcErrorMessage });
        }
        
        const asset = heliusResponse.result;
        
        if (!asset || !asset.id) {
            const notFoundMessage = `Token mint not found or invalid response from Helius for address: ${mintAddress}`;
            return res.status(404).json({ error: notFoundMessage });
        }
        
        const content = asset.content;
        const tokenInfo = asset.token_info;
        const authorities = asset.authorities;
        const ownership = asset.ownership;
        const splTokenInfo = asset.spl_token_info;

        const name = content?.metadata?.name ?? 'Unknown Token';
        const symbol = content?.metadata?.symbol ?? 'N/A';
        const logo = content?.links?.image ?? null;
        const decimals = tokenInfo?.decimals ?? 0;
        
        const creatorAddress = authorities?.find((a: any) => a?.scopes?.includes('owner'))?.address 
            || (Array.isArray(authorities) && authorities[0]?.address)
            || ownership?.owner 
            || 'Unknown';

        const updateAuthority = asset.compression?.compressed === false
            ? authorities?.find((a: any) => a?.scopes?.includes('metaplex_metadata_update'))?.address ?? null
            : null;
            
        const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const tokenStandard = ownership?.program === TOKEN_2022_PROGRAM_ID ? 'Token-2022' : 'SPL Token';
        
        let totalSupply: number = 0;
        const supplyRaw = tokenInfo?.supply;

        if (supplyRaw !== null && supplyRaw !== undefined && decimals !== undefined) {
            try {
                // Using Number is more robust against various formats (including scientific notation)
                // that BigInt might reject. Precision loss is acceptable for display purposes.
                const supplyNum = Number(supplyRaw);
                if (!isNaN(supplyNum)) {
                    totalSupply = supplyNum / Math.pow(10, decimals);
                }
            } catch (e) {
                console.error(`Could not parse or calculate supply for mint ${mintAddress}. Supply raw: "${supplyRaw}", Decimals: ${decimals}. Error: ${e instanceof Error ? e.message : String(e)}`);
                totalSupply = 0; // fallback
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

        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`Token Info API error for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return res.status(500).json({ error: `Failed to process token data. Reason: ${errorMessage}` });
    }
}
