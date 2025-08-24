import type { TokenDetails, TokenExtension } from '../types.ts';

// Main handler function
export default async function handler(req: any, res: any) {
    const { mint: mintAddress } = req.query;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }

    const QUICKNODE_RPC_URL = 'https://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/';

    try {
        // Step 1: Fetch asset data from QuickNode for on-chain details and metadata
        const rpcResponse = await fetch(QUICKNODE_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAsset',
                params: { id: mintAddress, displayOptions: { showFungible: true } },
            }),
        });

        if (!rpcResponse.ok) throw new Error(`QuickNode API failed with status ${rpcResponse.status}`);
        
        const rpcData = await rpcResponse.json();
        if (rpcData.error) throw new Error(`QuickNode RPC Error: ${rpcData.error.message}`);
        
        const asset = rpcData.result;
        if (!asset || !asset.id) {
            return res.status(404).json({ error: `Token data not found.` });
        }

        // --- Parse RPC Data ---
        const content = asset.content || {};
        const metadata = content.metadata || {};
        const links = content.links || {};
        const tokenInfo = asset.token_info || {};
        const ownership = asset.ownership || {};
        const authorities = Array.isArray(asset.authorities) ? asset.authorities : [];
        const splTokenInfo = asset.spl_token_info || {};
        const decimals = tokenInfo.decimals ?? 0;

        let totalSupply = 0;
        try {
            // Defensive parsing for potentially very large numbers
            totalSupply = parseFloat(tokenInfo.supply) / Math.pow(10, decimals);
        } catch { /* Fails gracefully, remains 0 */ }
        
        const TOKEN_2022_PROGRAM_ID = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        const tokenStandard = ownership.program === TOKEN_2022_PROGRAM_ID ? 'Token-2022' : 'SPL Token';
        
        let tokenExtensions: TokenExtension[] = [];
        if (tokenStandard === 'Token-2022' && Array.isArray(splTokenInfo.token_extensions)) {
            tokenExtensions = splTokenInfo.token_extensions.map((ext: any) => ({
                extension: ext?.extension || 'unknown',
                state: { ...(ext?.state || {}), mintDecimals: decimals },
            }));
        }
        
        const responseData: Partial<TokenDetails> = {
            mintAddress: asset.id,
            name: metadata.name || 'Unknown Token',
            symbol: metadata.symbol || 'N/A',
            logo: links.image || null,
            decimals,
            totalSupply,
            description: metadata.description || null,
            links: links,
            creatorAddress: authorities.find(a => a?.scopes?.includes('owner'))?.address || ownership.owner || 'Unknown',
            mintAuthority: tokenInfo.mint_authority ?? null,
            freezeAuthority: tokenInfo.freeze_authority ?? null,
            updateAuthority: authorities.find(a => a?.scopes?.includes('metaplex_metadata_update'))?.address ?? null,
            tokenStandard,
            tokenExtensions,
        };

        // Step 2: Fetch LIVE market data from DexScreener
        try {
            const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`;
            const dexResponse = await fetch(dexScreenerUrl);
            if (dexResponse.ok) {
                const dexData = await dexResponse.json();
                if (dexData.pairs && dexData.pairs.length > 0) {
                    // Find the most liquid pair
                    const primaryPair = dexData.pairs.reduce((prev: any, current: any) => 
                        (prev.liquidity?.usd ?? 0) > (current.liquidity?.usd ?? 0) ? prev : current
                    );

                    responseData.pricePerToken = parseFloat(primaryPair.priceUsd) || 0;
                    responseData.marketCap = primaryPair.marketCap ?? 0; // Use marketCap directly if available
                    responseData.fdv = primaryPair.fdv ?? 0;
                    responseData.volume24h = primaryPair.volume?.h24 || 0;
                    responseData.price24hChange = primaryPair.priceChange?.h24 || 0;
                    responseData.liquidity = primaryPair.liquidity?.usd || 0;
                    responseData.pairAddress = primaryPair.pairAddress;
                    responseData.poolCreatedAt = primaryPair.pairCreatedAt ? new Date(primaryPair.pairCreatedAt).getTime() : undefined;
                    responseData.txns = {
                        h24: {
                            buys: primaryPair.txns?.h24?.buys ?? 0,
                            sells: primaryPair.txns?.h24?.sells ?? 0
                        }
                    };
                    responseData.dexId = primaryPair.dexId;
                }
            }
        } catch (dexError) {
            console.warn(`Could not fetch market data for ${mintAddress} from DexScreener:`, dexError);
            // Gracefully continue without market data, the frontend will handle this
        }

        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve token data. Reason: ${errorMessage}` });
    }
}