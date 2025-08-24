
import type { TokenDetails } from '../types.ts';
import { PublicKey } from '@solana/web3.js';

// Main handler function
export default async function handler(req: any, res: any) {
    const { mint: mintAddress } = req.query;

    if (!mintAddress || typeof mintAddress !== 'string') {
        return res.status(400).json({ error: "Mint address is required." });
    }

    const quicknodeUrl = 'https://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/';

    try {
        const responseData: Partial<TokenDetails> = { mintAddress };

        // --- Step 1: Fetch metadata from Jupiter Token List (more reliable for name, symbol, logo) ---
        try {
            const jupiterResponse = await fetch('https://token.jup.ag/all');
            if (jupiterResponse.ok) {
                const tokenList = await jupiterResponse.json();
                const tokenMeta = tokenList.find((t: any) => t.address === mintAddress);
                if (tokenMeta) {
                    responseData.name = tokenMeta.name;
                    responseData.symbol = tokenMeta.symbol;
                    responseData.logo = tokenMeta.logoURI;
                    responseData.decimals = tokenMeta.decimals;
                }
            }
        } catch (e) {
            console.warn(`Could not fetch metadata from Jupiter for ${mintAddress}:`, e);
        }
        
        // --- Step 2: Fetch on-chain data using standard getParsedAccountInfo ---
        try {
            const rpcResponse = await fetch(quicknodeUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'my-id',
                    method: 'getParsedAccountInfo',
                    params: [mintAddress],
                }),
            });
            if (!rpcResponse.ok) throw new Error(`RPC getParsedAccountInfo failed with status ${rpcResponse.status}`);

            const rpcData = await rpcResponse.json();
            if (rpcData.error) throw new Error(`RPC Error: ${rpcData.error.message}`);
            
            const accountInfo = rpcData.result?.value?.data?.parsed?.info;
            if (accountInfo) {
                responseData.decimals = accountInfo.decimals;
                responseData.totalSupply = parseFloat(accountInfo.supply) / Math.pow(10, accountInfo.decimals);
                responseData.mintAuthority = accountInfo.mintAuthority;
                responseData.freezeAuthority = accountInfo.freezeAuthority;
            }
        } catch(e) {
             console.error(`Could not fetch on-chain account info for ${mintAddress}:`, e);
             // If this fails, we might not have vital info, but we can continue if other sources work
        }

        // --- Step 3: Fetch LIVE market data from DexScreener ---
        try {
            const dexScreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`;
            const dexResponse = await fetch(dexScreenerUrl);
            if (dexResponse.ok) {
                const dexData = await dexResponse.json();
                if (dexData.pairs && dexData.pairs.length > 0) {
                    const primaryPair = dexData.pairs.reduce((prev: any, current: any) => 
                        (prev.liquidity?.usd ?? 0) > (current.liquidity?.usd ?? 0) ? prev : current
                    );

                    responseData.pricePerToken = parseFloat(primaryPair.priceUsd) || 0;
                    responseData.marketCap = primaryPair.marketCap ?? 0;
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
        }
        
        // --- Final Fallbacks ---
        if (!responseData.name) responseData.name = 'Unknown Token';
        if (!responseData.symbol) responseData.symbol = 'N/A';
        if (!responseData.decimals) responseData.decimals = 0;

        return res.status(200).json(responseData);

    } catch (error) {
        console.error(`[FATAL] Unhandled error in token-info API for mint ${mintAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve token data. Reason: ${errorMessage}` });
    }
}
