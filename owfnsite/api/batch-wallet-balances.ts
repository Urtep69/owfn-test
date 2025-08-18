import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { Token } from '../types.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';
import React from 'react';

const KNOWN_TOKEN_ICONS: { [mint: string]: React.ReactNode } = {
    'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B': React.createElement(OwfnIcon, null),
    'So11111111111111111111111111111111111111112': React.createElement(SolIcon, null),
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a': React.createElement(UsdcIcon, null),
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': React.createElement(UsdtIcon, null),
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { addresses } = req.body;
    if (!Array.isArray(addresses) || addresses.length === 0) {
        return res.status(400).json({ error: "An array of wallet addresses is required." });
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
    if (!HELIUS_API_KEY) {
        console.error("CRITICAL: HELIUS_API_KEY environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error. API key is missing." });
    }

    try {
        const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
        
        // 1. Create a batch request for Helius
        const batchRequest = addresses.map((address, index) => ({
            jsonrpc: '2.0',
            id: `wallet-${index}`,
            method: 'getAssetsByOwner',
            params: {
                ownerAddress: address,
                page: 1,
                limit: 1000,
                displayOptions: {
                    showFungible: true,
                    showNativeBalance: true,
                },
            },
        }));

        const heliusResponse = await fetch(heliusUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchRequest),
        });

        if (!heliusResponse.ok) {
            throw new Error(`Helius batch API failed with status ${heliusResponse.status}`);
        }

        const batchResults = await heliusResponse.json();

        // 2. Process the batch response
        const walletsData: Record<string, Token[]> = {};
        const allSplMints = new Set<string>();

        batchResults.forEach((result: any, index: number) => {
            const ownerAddress = addresses[index];
            const items = result.result?.items || [];
            const nativeBalance = result.result?.nativeBalance;
            const walletTokens: Token[] = [];

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
                    logo: KNOWN_TOKEN_ICONS['So11111111111111111111111111111111111111112']
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
                        logo: KNOWN_TOKEN_ICONS[asset.id] || React.createElement(GenericTokenIcon, { uri: asset.content?.links?.image }),
                        usdValue: 0,
                        pricePerToken: 0,
                    });
                    allSplMints.add(asset.id);
                }
            });
            
            walletsData[ownerAddress] = walletTokens;
        });

        // 3. Fetch all prices in a single batch from Jupiter
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
        
        // 4. Sort tokens within each wallet by USD value
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