import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { Token } from '../types.ts';

// Main handler function
export default async function handler(req: any, res: any) {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: "Wallet address is required." });
    }

    const HELIUS_API_KEY = "a37ba545-d429-43e3-8f6d-d51128c49da9";
    if (!HELIUS_API_KEY) {
        console.error("CRITICAL: HELIUS_API_KEY is not set.");
        return res.status(500).json({ error: "Server configuration error. API key is missing." });
    }

    try {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
        const response = await fetch(heliusUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAssetsByOwner',
                params: {
                    ownerAddress: walletAddress,
                    page: 1,
                    limit: 1000,
                    displayOptions: {
                        showFungible: true,
                        showNativeBalance: true,
                    },
                },
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Helius API failed with status ${response.status}`);
        }

        const { result } = await response.json();
        if (!result) {
             return res.status(200).json([]);
        }
       
        const allTokens: Partial<Token>[] = [];

        if (result.nativeBalance && result.nativeBalance.lamports > 0) {
            const balance = result.nativeBalance.lamports / LAMPORTS_PER_SOL;
            const solToken: Partial<Token> = {
                mintAddress: 'So11111111111111111111111111111111111111112',
                balance: balance,
                decimals: 9,
                name: 'Solana',
                symbol: 'SOL',
                pricePerToken: result.nativeBalance.price_per_sol || 0,
                usdValue: result.nativeBalance.total_price || (balance * (result.nativeBalance.price_per_sol || 0)),
            };
            allTokens.push(solToken);
        }

        const splTokens: any[] = (result.items || [])
            .filter((asset: any) => asset.interface === 'FungibleToken' && asset.token_info?.balance > 0 && !asset.compression?.compressed)
            .map((asset: any) => ({
                mintAddress: asset.id,
                balance: asset.token_info.balance / Math.pow(10, asset.token_info.decimals),
                decimals: asset.token_info.decimals,
                name: asset.content?.metadata?.name || 'Unknown Token',
                symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}..`,
                logoUri: asset.content?.links?.image, // Send URI, not ReactNode
                usdValue: 0,
                pricePerToken: 0,
            }));

        allTokens.push(...splTokens);

        if (allTokens.length === 0) return res.status(200).json([]);
        
        const splMintsToFetch = splTokens.map(t => t.mintAddress).join(',');
        if (splMintsToFetch) {
            try {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${splMintsToFetch}`);
                if (!priceRes.ok) throw new Error(`Jupiter API failed with status ${priceRes.status}`);
                
                const priceData = await priceRes.json();
                
                if (priceData.data) {
                     allTokens.forEach(token => {
                        if (token.mintAddress === 'So11111111111111111111111111111111111111112') return;
                        const priceInfo = priceData.data[token.mintAddress!];
                        if (priceInfo && priceInfo.price) {
                            const price = priceInfo.price;
                            token.pricePerToken = price;
                            token.usdValue = (token.balance || 0) * price;
                        }
                    });
                }
            } catch (priceError) {
                console.warn(`Could not fetch token prices for ${walletAddress} from Jupiter API:`, priceError);
            }
        }
        
        const sortedTokens = allTokens.sort((a,b) => (b.usdValue || 0) - (a.usdValue || 0));
        return res.status(200).json(sortedTokens);

    } catch (error) {
        console.error(`[FATAL] Error in wallet-balances API for address ${walletAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve wallet balances. Reason: ${errorMessage}` });
    }
}