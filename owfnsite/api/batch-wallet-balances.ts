import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { Token } from '../types.ts';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { addresses } = req.body;
    if (!Array.isArray(addresses) || addresses.length === 0) {
        return res.status(400).json({ error: "An array of wallet addresses is required." });
    }

    const HELIUS_API_KEY = "a37ba545-d429-43e3-8f6d-d51128c49da9";
    if (!HELIUS_API_KEY) {
        console.error("CRITICAL: HELIUS_API_KEY is not set.");
        return res.status(500).json({ error: "Server configuration error. API key is missing." });
    }

    try {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
        
        // Use Promise.allSettled to fetch all balances in parallel, preventing one failure from stopping all.
        const promises = addresses.map(ownerAddress =>
            fetch(heliusUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: `wallet-${ownerAddress}`,
                    method: 'getAssetsByOwner',
                    params: {
                        ownerAddress,
                        page: 1,
                        limit: 1000,
                        displayOptions: {
                            showFungible: true,
                            showNativeBalance: true,
                        },
                    },
                }),
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`Helius API failed for ${ownerAddress} with status ${response.status}`);
                }
                return response.json();
            })
        );

        const results = await Promise.allSettled(promises);

        const walletsData: Record<string, any[]> = {};
        const allSplMints = new Set<string>();

        results.forEach((result, index) => {
            const ownerAddress = addresses[index];
            if (result.status === 'fulfilled') {
                const heliusData = result.value;
                const items = heliusData.result?.items || [];
                const nativeBalance = heliusData.result?.nativeBalance;
                const walletTokens: any[] = [];

                if (nativeBalance && nativeBalance.lamports > 0) {
                    const balance = nativeBalance.lamports / LAMPORTS_PER_SOL;
                    walletTokens.push({
                        mintAddress: 'So11111111111111111111111111111111111111112',
                        balance: balance,
                        decimals: 9,
                        name: 'Solana',
                        symbol: 'SOL',
                        pricePerToken: nativeBalance.price_per_sol || 0,
                        usdValue: nativeBalance.total_price || (balance * (nativeBalance.price_per_sol || 0)),
                        logoUri: null
                    });
                }

                items.forEach((asset: any) => {
                    if (asset.interface === 'FungibleToken' && asset.token_info?.balance > 0 && !asset.compression?.compressed) {
                        walletTokens.push({
                            mintAddress: asset.id,
                            balance: asset.token_info.balance / Math.pow(10, asset.token_info.decimals),
                            decimals: asset.token_info.decimals,
                            name: asset.content?.metadata?.name || 'Unknown Token',
                            symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}..`,
                            logoUri: asset.content?.links?.image,
                            usdValue: 0,
                            pricePerToken: 0,
                        });
                        allSplMints.add(asset.id);
                    }
                });
                walletsData[ownerAddress] = walletTokens;
            } else {
                 console.error(`Failed to fetch assets for ${ownerAddress}:`, result.reason);
                 walletsData[ownerAddress] = []; // Ensure the key exists even on failure
            }
        });

        if (allSplMints.size > 0) {
            try {
                const mintsToFetch = Array.from(allSplMints).join(',');
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${mintsToFetch}`);
                if (priceRes.ok) {
                    const priceData = await priceRes.json();
                    if (priceData.data) {
                        for (const address in walletsData) {
                            walletsData[address].forEach(token => {
                                if (token.symbol !== 'SOL') {
                                    const priceInfo = priceData.data[token.mintAddress];
                                    if (priceInfo && priceInfo.price) {
                                        token.pricePerToken = priceInfo.price;
                                        token.usdValue = token.balance * priceInfo.price;
                                    }
                                }
                            });
                        }
                    }
                }
            } catch (priceError) {
                console.warn(`Could not fetch batch token prices from Jupiter API:`, priceError);
            }
        }
        
        for (const address in walletsData) {
            walletsData[address].sort((a, b) => b.usdValue - a.usdValue);
        }

        return res.status(200).json(walletsData);

    } catch (error) {
        console.error(`[FATAL] Error in batch-wallet-balances API:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";
        return res.status(500).json({ error: `Failed to retrieve wallet balances. Reason: ${errorMessage}` });
    }
}