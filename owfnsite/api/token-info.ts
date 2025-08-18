import type { TokenDetails, TokenExtension } from '../types.ts';

// Main handler function
export default async function handler(req: any, res: any) {
    // Extract mint address from query parameters
    const { mint: mintAddress } = req.query;

    // Validate input
    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required and must be a string." });
    }

    // Hardcode API key to resolve environment variable issue on the deployment platform.
    const HELIUS_API_KEY = 'a37ba545-d429-43e3-8f6d-d51128c49da9';

    if (!HELIUS_API_KEY) {
        // This block is now a safeguard and should never be reached.
        console.error("Server configuration error: HELIUS_API_KEY is not set.");
        return res.status(500).json({ error: "Server configuration error. API key is missing." });
    }

    try {
        // Step 1: Fetch asset data from Helius
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
        const fetchResponse = await fetch(heliusUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAsset',
                params: { id: mintAddress, displayOptions: { showFungible: true } },
            }),
        });

        if (!fetchResponse.ok) {
            // Handle non-200 responses from Helius
            throw new Error(`Helius API request failed with status ${fetchResponse.status}`);
        }

        const heliusData = await fetchResponse.json();

        // Handle JSON-RPC level errors (e.g., invalid params, method not found)
        if (heliusData.error) {
            throw new Error(`Helius RPC Error: ${heliusData.error.message} (Code: ${heliusData.error.code})`);
        }

        const asset = heliusData.result;

        // Handle cases where the asset is not found
        if (!asset || !asset.id) {
            return res.status(404).json({ error: `Token with mint address ${mintAddress} not found.` });
        }
        
        // Step 2: Safely parse the Helius response
        // Use default empty objects to prevent errors on null/undefined properties
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const tokenInfo = asset.token_info || {};
        const ownership = asset.ownership || {};
        const authorities = Array.isArray(asset.authorities) ? asset.authorities : [];
        const splTokenInfo = asset.spl_token_info || {};

        const decimals = tokenInfo.decimals ?? 0;

        // Safely calculate total supply
        let totalSupply = 0;
        try {
            const supplyRaw = tokenInfo.supply;
            if (supplyRaw != null) {
                const supplyNum = Number(supplyRaw);
                if (!isNaN(supplyNum)) {
                    totalSupply = supplyNum / Math.pow(10, decimals);
                }
            }
        } catch (e) {
            console.error(`Error calculating supply for ${mintAddress}:`, e);
            // totalSupply remains 0, which is a safe fallback
        }

        // Safely determine authorities
        let creatorAddress = 'Unknown';
        let updateAuthority = null;
        try {
            creatorAddress = authorities.find(a => a?.scopes?.includes('owner'))?.address || ownership.owner || 'Unknown';
            if (asset.compression?.compressed === false) {
                updateAuthority = authorities.find(a => a?.scopes?.includes('metaplex_metadata_update'))?.address ?? null;
            }
        } catch (e) {
            console.error(`Error parsing authorities for ${mintAddress}:`, e);
        }

        // Determine token standard
        const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const tokenStandard = ownership.program === TOKEN_2022_PROGRAM_ID ? 'Token-2022' : 'SPL Token';
        
        // Safely parse token extensions for Token-2022
        let tokenExtensions: TokenExtension[] = [];
        try {
            const extensionsRaw = splTokenInfo.token_extensions;
            if (Array.isArray(extensionsRaw)) {
                tokenExtensions = extensionsRaw.map((ext: any) => ({
                    extension: ext?.extension || 'unknownExtension',
                    state: { ...(ext?.state || {}), mintDecimals: decimals },
                }));
            }
        } catch (e) {
            console.error(`Error parsing token extensions for ${mintAddress}:`, e);
        }

        // Step 3: Construct the final response object
        const responseData: Partial<TokenDetails> = {
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || 'N/A',
            logo: links.image || null,
            decimals,
            totalSupply,
            creatorAddress,
            mintAuthority: tokenInfo.mint_authority ?? null,
            freezeAuthority: tokenInfo.freeze_authority ?? null,
            updateAuthority,
            tokenStandard,
            tokenExtensions,
        };

        // Step 4: Send the successful response
        return res.status(200).json(responseData);

    } catch (error) {
        // Universal catch block for any unexpected error during the process
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        
        // Ensure a valid JSON error response is always sent
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve token data. Reason: ${errorMessage}` });
    }
}
