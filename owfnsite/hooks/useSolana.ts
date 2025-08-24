import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, SOLANA_RPC_URL, PRESALE_DETAILS } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';

// --- TYPE DEFINITION FOR THE HOOK'S RETURN VALUE ---
export interface UseSolanaReturn {
  connected: boolean;
  address: string | null;
  userTokens: Token[];
  loading: boolean;
  userStats: {
    totalDonated: number;
    projectsSupported: number;
    votesCast: number;
    donations: any[]; 
    votedProposalIds: string[];
  };
  stakedBalance: number;
  earnedRewards: number;
  connection: Connection;
  disconnectWallet: () => Promise<void>;
  getWalletBalances: (walletAddress: string) => Promise<Token[]>;
  sendTransaction: (to: string, amount: number, tokenSymbol: string) => Promise<{ success: boolean; messageKey: string; signature?: string; params?: Record<string, string | number> }>;
  stakeTokens: (amount: number) => Promise<any>;
  unstakeTokens: (amount: number) => Promise<any>;
  claimRewards: () => Promise<any>;
  claimVestedTokens: (amount: number) => Promise<any>;
  voteOnProposal: (proposalId: string, vote: 'for' | 'against') => Promise<any>;
}

const KNOWN_TOKEN_ICONS: { [mint: string]: React.ReactNode } = {
    [OWFN_MINT_ADDRESS]: React.createElement(OwfnIcon, null),
    'So11111111111111111111111111111111111111112': React.createElement(SolIcon, null),
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a': React.createElement(UsdcIcon, null),
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': React.createElement(UsdtIcon, null),
};

const balanceCache = new Map<string, { data: Token[], timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useSolana = (): UseSolanaReturn => {  
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction: walletSendTransaction, signTransaction, disconnect } = useWallet();
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const getWalletBalances = useCallback(async (walletAddress: string): Promise<Token[]> => {
    const cached = balanceCache.get(walletAddress);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }
      
    setLoading(true);
    try {
        const response = await fetch(SOLANA_RPC_URL, {
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
            console.error('QuickNode API Error:', await response.text());
            throw new Error('Failed to fetch assets from QuickNode');
        }

        const { result } = await response.json();
        
        if (!result) {
             return [];
        }
       
        const allTokens: Token[] = [];
        const mintsToPrice: string[] = ['So11111111111111111111111111111111111111112'];

        // Collect all fungible token mints for price fetching
        if (result.items && Array.isArray(result.items)) {
            result.items.forEach((asset: any) => {
                // We check for token_info existence to identify fungibles, which is more robust
                // than checking the 'interface' string.
                if (asset.id && asset.token_info && asset.token_info.balance > 0) {
                    mintsToPrice.push(asset.id);
                }
            });
        }
        
        // Fetch prices in a single batch call
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

        // Process native SOL balance
        if (result.nativeBalance && result.nativeBalance > 0) {
            const balance = result.nativeBalance / LAMPORTS_PER_SOL;
            const solToken: Token = {
                mintAddress: 'So11111111111111111111111111111111111111112',
                balance: balance,
                decimals: 9,
                name: 'Solana',
                symbol: 'SOL',
                logo: React.createElement(SolIcon, null),
                pricePerToken: solPrice,
                usdValue: balance * solPrice,
            };
            allTokens.push(solToken);
        }

        // Process SPL tokens from the 'items' array robustly
        if (result.items && Array.isArray(result.items)) {
            const splTokens: Token[] = result.items
                .map((asset: any): Token | null => {
                    try {
                        // New robust filtering: Instead of checking a specific 'interface' string,
                        // we identify a fungible token by its essential properties. This works for
                        // standard SPL tokens and newer Token-2022 assets (V1_FUNGIBLE_ASSET).
                        const tokenData = asset.token_info;

                        if (
                            !tokenData ||
                            typeof tokenData.balance === 'undefined' ||
                            tokenData.balance === null ||
                            tokenData.balance === '0' ||
                            typeof tokenData.decimals !== 'number' ||
                            tokenData.decimals === 0
                        ) {
                            // This asset is not a fungible token with a positive balance that we can display.
                            return null;
                        }

                        const { balance: balanceRaw, decimals } = tokenData;

                        // Robust balance calculation using string manipulation.
                        let balance: number;
                        const balanceString = balanceRaw.toString();
                        
                        if (balanceString.length > decimals) {
                            const integerPart = balanceString.slice(0, balanceString.length - decimals);
                            const fractionalPart = balanceString.slice(balanceString.length - decimals);
                            balance = Number(`${integerPart}.${fractionalPart}`);
                        } else {
                            const padded = balanceString.padStart(decimals, '0');
                            balance = Number(`0.${padded}`);
                        }
                        
                        if (balance <= 0 || !isFinite(balance)) {
                            return null;
                        }

                        const mintAddress = asset.id;
                        const price = prices.get(mintAddress) || 0;
                        const metadata = asset.content?.metadata;
                        const links = asset.content?.links;

                        return {
                            mintAddress,
                            balance,
                            decimals,
                            name: metadata?.name || 'Unknown Token',
                            symbol: metadata?.symbol || mintAddress.substring(0, 4) + '...',
                            logo: KNOWN_TOKEN_ICONS[mintAddress] || React.createElement(GenericTokenIcon, { uri: links?.image }),
                            pricePerToken: price,
                            usdValue: balance * price,
                        };
                    } catch (e) {
                        console.error(`Error processing asset ${asset.id}:`, e, asset);
                        return null; // Ensure any error skips the token, not crashing the loop.
                    }
                })
                .filter((token): token is Token => token !== null);

            allTokens.push(...splTokens);
        }
        
        const sortedTokens = allTokens.sort((a,b) => b.usdValue - a.usdValue);
        balanceCache.set(walletAddress, { data: sortedTokens, timestamp: Date.now() });
        return sortedTokens;

    } catch (error) {
        console.error("Error fetching wallet balances:", error);
        return [];
    } finally {
        setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    if (connected && address) {
      getWalletBalances(address).then(setUserTokens);
    } else {
      setUserTokens([]);
      balanceCache.clear(); // Clear cache on disconnect
    }
  }, [connected, address, getWalletBalances]);

 const sendTransaction = useCallback(async (to: string, amount: number, tokenSymbol: string): Promise<{ success: boolean; messageKey: string; signature?: string; params?: Record<string, string | number>}> => {
    if (!connected || !publicKey || !signTransaction) {
      return { success: false, messageKey: 'connect_wallet_first' };
    }
    setLoading(true);

    try {
        const toPublicKey = new PublicKey(to);
        const instructions: TransactionInstruction[] = [];
        
        if (tokenSymbol === 'SOL') {
            instructions.push(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: toPublicKey,
                    lamports: Math.round(amount * LAMPORTS_PER_SOL),
                })
            );
        } else {
            const mintAddress = KNOWN_TOKEN_MINT_ADDRESSES[tokenSymbol];
            if (!mintAddress) throw new Error(`Unknown token symbol: ${tokenSymbol}`);

            const mintPublicKey = new PublicKey(mintAddress);
            const tokenInfo = userTokens.find(t => t.symbol === tokenSymbol);
            if (!tokenInfo) throw new Error(`Token ${tokenSymbol} not found in user's wallet.`);
            
            const decimals = tokenInfo.decimals;
            const transferAmount = BigInt(Math.round(amount * Math.pow(10, decimals)));

            const fromTokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
            const toTokenAccount = await getAssociatedTokenAddress(mintPublicKey, toPublicKey);
            
            try {
                await getAccount(connection, toTokenAccount, 'confirmed');
            } catch (error) {
                if (error instanceof Error && (error.name === 'TokenAccountNotFoundError' || error.message.includes('not found'))) {
                    instructions.push(
                        createAssociatedTokenAccountInstruction(
                            publicKey,
                            toTokenAccount,
                            toPublicKey,
                            mintPublicKey
                        )
                    );
                } else {
                    throw error;
                }
            }
            
            instructions.push(
                createTransferInstruction(
                    fromTokenAccount,
                    toTokenAccount,
                    publicKey,
                    transferAmount
                )
            );
        }

        const latestBlockHash = await connection.getLatestBlockhash('finalized');
        
        const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: latestBlockHash.blockhash,
            instructions,
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);

        const signedTransaction = await signTransaction(transaction);

        const signature = await connection.sendTransaction(signedTransaction, {
            skipPreflight: false,
            preflightCommitment: 'finalized',
        });
        
        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature
        }, 'finalized');

        console.log(`Transaction successful with signature: ${signature}`);
        setLoading(false);
        if (address) {
            balanceCache.delete(address);
            getWalletBalances(address).then(setUserTokens);
        }
        return { success: true, signature, messageKey: 'transaction_success_alert', params: { amount, tokenSymbol } };

    } catch (error) {
        console.error("Transaction failed:", error);
        setLoading(false);
        return { success: false, messageKey: 'transaction_failed_alert' };
    }
  }, [connected, publicKey, connection, signTransaction, userTokens, address, getWalletBalances]);
  
  const notImplemented = async (..._args: any[]): Promise<any> => {
      console.warn("This feature is a placeholder and not implemented on-chain yet.");
      alert("This feature is coming soon and requires on-chain programs to be deployed.");
      return Promise.resolve({ success: false, messageKey: 'coming_soon_title'});
  }

  return {
    connected,
    address,
    userTokens,
    loading,
    connection,
    userStats: { 
        totalDonated: 0,
        projectsSupported: 0,
        votesCast: 0,
        donations: [],
        votedProposalIds: []
    },
    stakedBalance: 0,
    earnedRewards: 0,
    disconnectWallet: disconnect,
    getWalletBalances,
    sendTransaction,
    stakeTokens: notImplemented,
    unstakeTokens: notImplemented,
    claimRewards: notImplemented,
    claimVestedTokens: notImplemented,
    voteOnProposal: notImplemented,
  };
};
