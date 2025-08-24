import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS } from '../constants.ts';

function getLogoData(mintAddress: string, imageUri?: string) {
    if (mintAddress === OWFN_MINT_ADDRESS) return { type: 'OwfnIcon', props: {} };
    if (mintAddress === 'So11111111111111111111111111111111111111112') return { type: 'SolIcon', props: {} };
    if (mintAddress === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a') return { type: 'UsdcIcon', props: {} };
    if (mintAddress === 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') return { type: 'UsdtIcon', props: {} };
    return { type: 'GenericTokenIcon', props: { uri: imageUri } };
}

export default async function handler(req: any, res: any) {
    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: "Wallet address is required." });
    }

    const rpcUrl = process.env.QUICKNODE_RPC_URL;
    if (!rpcUrl) {
        console.error("CRITICAL: QUICKNODE_RPC_URL environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error: RPC URL not configured." });
    }

    try {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'qn_getAssetsByOwner',
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
            let errorMsg = `Failed to fetch assets from QuickNode. Status: ${response.status}`;
            try {
                const errorData = await response.json();
                if(errorData.error && errorData.error.message){
                    errorMsg = `QuickNode RPC Error: ${errorData.error.message}`;
                }
            } catch(e) { /* response might not be json */ }
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        const { result } = await response.json();
        
        if (!result) {
             return res.status(200).json([]);
        }
       
        type SerializableToken = Omit<Token, 'logo'> & { logo: { type: string, props: any } | string };
        const allTokens: SerializableToken[] = [];
        const mintsToPrice: string[] = ['So11111111111111111111111111111111111111112'];

        if (result.items && Array.isArray(result.items)) {
            result.items.forEach((asset: any) => {
                const tokenData = asset.token_info || asset.ownership?.token_info;
                if (asset.id && tokenData && tokenData.balance > 0) {
                    mintsToPrice.push(asset.id);
                }
            });
        }
        
        const prices = new Map<string, number>();
        try {
            const uniqueMints = [...new Set(mintsToPrice)];
            const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${uniqueMints.join(',')}`);
            if (priceRes.ok) {
                const priceData = await priceRes.json();
                if (priceData.data) {
                    for (const mint in priceData.data) {
                        prices.set(mint, priceData.data[mint].price);
                    }
                }
            }
        } catch (e) { console.error("Could not fetch prices from Jupiter API", e); }
        
        const solPrice = prices.get('So11111111111111111111111111111111111111112') || 0;

        if (result.nativeBalance && result.nativeBalance > 0) {
            const balance = result.nativeBalance / LAMPORTS_PER_SOL;
            const solToken: SerializableToken = {
                mintAddress: 'So11111111111111111111111111111111111111112',
                balance: balance,
                decimals: 9,
                name: 'Solana',
                symbol: 'SOL',
                logo: getLogoData('So1111111111111111111111111111111111111111112'),
                pricePerToken: solPrice,
                usdValue: balance * solPrice,
            };
            allTokens.push(solToken);
        }

        if (result.items && Array.isArray(result.items)) {
            const splTokens: SerializableToken[] = result.items
                .map((asset: any): SerializableToken | null => {
                    try {
                        const tokenData = asset.token_info || asset.ownership?.token_info;

                        if (!tokenData || (typeof tokenData.balance !== 'string' && typeof tokenData.balance !== 'number') || tokenData.balance === '0' || tokenData.balance === 0 || typeof tokenData.decimals !== 'number') {
                            return null;
                        }
                        
                        const balance = Number(BigInt(tokenData.balance)) / (10 ** tokenData.decimals);

                        if (balance <= 0 || !isFinite(balance)) return null;

                        const mintAddress = asset.id;
                        const price = prices.get(mintAddress) || 0;
                        const metadata = asset.content?.metadata;
                        const links = asset.content?.links;

                        return {
                            mintAddress,
                            balance,
                            decimals: tokenData.decimals,
                            name: metadata?.name || 'Unknown Token',
                            symbol: metadata?.symbol || mintAddress.substring(0, 4) + '...',
                            logo: getLogoData(mintAddress, links?.image),
                            pricePerToken: price,
                            usdValue: balance * price,
                        };
                    } catch (e) {
                        console.error(`Error processing asset ${asset.id}:`, e, asset);
                        return null;
                    }
                })
                .filter((token): token is SerializableToken => token !== null);

            allTokens.push(...splTokens);
        }
        
        const sortedTokens = allTokens.sort((a,b) => b.usdValue - a.usdValue);
        
        return res.status(200).json(sortedTokens);
    } catch (error) {
        console.error(`Error in wallet-balances API for address ${walletAddress}:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve wallet balances. Reason: ${errorMessage}` });
    }
}