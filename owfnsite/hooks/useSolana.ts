import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, HELIUS_RPC_URL, PRESALE_DETAILS, MOCK_TOKEN_DETAILS } from '../constants.ts';
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
  connectWallet: () => void;
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
  const { setVisible } = useWalletModal();
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const connectWallet = useCallback(() => {
    if (!connected) {
      setVisible(true);
    }
  }, [connected, setVisible]);

  const getWalletBalances = useCallback(async (walletAddress: string): Promise<Token[]> => {
    const cached = balanceCache.get(walletAddress);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }
      
    setLoading(true);
    try {
        const response = await fetch(HELIUS_RPC_URL, {
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
            console.error('Helius API Error:', await response.text());
            throw new Error('Failed to fetch assets from Helius');
        }

        const { result } = await response.json();
        
        if (!result) {
             return [];
        }
       
        const allTokens: Token[] = [];
        let solPrice = 0;

        // Process native SOL balance first using data directly from Helius
        if (result.nativeBalance && result.nativeBalance.lamports > 0) {
            const pricePerSol = result.nativeBalance.price_per_sol || 0;
            const balance = result.nativeBalance.lamports / LAMPORTS_PER_SOL;
            solPrice = pricePerSol;

            const solToken: Token = {
                mintAddress: 'So11111111111111111111111111111111111111112',
                balance: balance,
                decimals: 9,
                name: 'Solana',
                symbol: 'SOL',
                logo: React.createElement(SolIcon, null),
                pricePerToken: pricePerSol,
                usdValue: result.nativeBalance.total_price || (balance * pricePerSol),
            };
            allTokens.push(solToken);
        }

        // Process SPL tokens from the 'items' array
        const splTokens: Token[] = (result.items || [])
            .filter((asset: any) => asset.interface === 'FungibleToken' && asset.token_info?.balance > 0 && !asset.compression?.compressed)
            .map((asset: any): Token => ({
                mintAddress: asset.id,
                balance: asset.token_info.balance / Math.pow(10, asset.token_info.decimals),
                decimals: asset.token_info.decimals,
                name: asset.content?.metadata?.name || 'Unknown Token',
                symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}..`,
                logo: KNOWN_TOKEN_ICONS[asset.id] || React.createElement(GenericTokenIcon, { uri: asset.content?.links?.image }),
                usdValue: 0,
                pricePerToken: 0,
            }));

        allTokens.push(...splTokens);

        if (allTokens.length === 0) return [];
        
        const splMintsToFetch = splTokens.map(t => t.mintAddress).join(',');

        if (splMintsToFetch) {
            try {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${splMintsToFetch}`);
                if (!priceRes.ok) throw new Error(`Jupiter API failed with status ${priceRes.status}`);
                
                const priceData = await priceRes.json();
                
                if (priceData.data) {
                     allTokens.forEach(token => {
                        if (token.mintAddress === 'So11111111111111111111111111111111111111112') return; // Skip SOL
                        const priceInfo = priceData.data[token.mintAddress];
                        if (priceInfo && priceInfo.price) {
                            const price = priceInfo.price;
                            token.pricePerToken = price;
                            token.usdValue = token.balance * price;
                        }
                    });
                }
            } catch (priceError) {
                console.error("Could not fetch token prices from Jupiter API:", priceError);
            }
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
  }, []);

  useEffect(() => {
    if (connected && address) {
      getWalletBalances(address).then(setUserTokens);
    } else {
      setUserTokens([]);
      balanceCache.clear(); // Clear cache on disconnect
    }
  }, [connected, address, getWalletBalances]);

  const sendTransaction = useCallback(async (to: string, amount: number, tokenSymbol: string): Promise<{ success: boolean; messageKey: string; signature?: string; params?: Record<string, string | number>}> => {
    if (!connected || !publicKey || !walletSendTransaction) {
      return { success: false, messageKey: 'connect_wallet_first' };
    }
    setLoading(true);

    try {
        const toPublicKey = new PublicKey(to);
        const transaction = new Transaction();
        
        if (tokenSymbol === 'SOL') {
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: toPublicKey,
                    lamports: Math.round(amount * LAMPORTS_PER_SOL), // Use Math.round to prevent float errors
                })
            );
        } else {
            const mintAddress = KNOWN_TOKEN_MINT_ADDRESSES[tokenSymbol];
            if (!mintAddress) throw new Error(`Unknown token symbol: ${tokenSymbol}`);

            const tokenDetails = MOCK_TOKEN_DETAILS[tokenSymbol];
            if (!tokenDetails) throw new Error(`Token details for ${tokenSymbol} not found in constants.`);
            
            const decimals = tokenDetails.decimals;
            const mintPublicKey = new PublicKey(mintAddress);
            
            const fromTokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
            const toTokenAccount = await getAssociatedTokenAddress(mintPublicKey, toPublicKey);
            
            transaction.add(
                createTransferInstruction(
                    fromTokenAccount,
                    toTokenAccount,
                    publicKey,
                    Math.round(amount * Math.pow(10, decimals))
                )
            );
        }
        
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = publicKey;

        // **RELIABILITY FIX**: Let the wallet adapter handle preflight, which is crucial for mobile compatibility.
        // **RELIABILITY FIX**: Use the modern, robust confirmation strategy with blockhash and height.
        const signature = await walletSendTransaction(transaction, connection);
        
        const confirmation = await connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        }, 'confirmed');

        if (confirmation.value.err) {
            throw new Error(`Transaction confirmation failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        console.log(`Transaction successful with signature: ${signature}`);
        
        if (address) {
            balanceCache.delete(address); // Invalidate cache after a transaction
            setTimeout(() => {
                getWalletBalances(address).then(setUserTokens);
            }, 1500); // Give RPCs a bit more time to sync
        }
        
        return { success: true, signature, messageKey: 'transaction_success_alert', params: { amount, tokenSymbol } };

    } catch (error) {
        console.error("Transaction failed:", error);
        return { success: false, messageKey: 'transaction_failed_alert' };
    } finally {
        setLoading(false);
    }
  }, [connected, publicKey, connection, walletSendTransaction, address, getWalletBalances]);
  
  // Memoize the userStats object to prevent unnecessary re-renders in consuming components.
  const userStats = useMemo(() => ({ 
      totalDonated: 0,
      projectsSupported: 0,
      votesCast: 0,
      donations: [],
      votedProposalIds: []
  }), []);

  // Wrap the placeholder function in useCallback to ensure it's a stable reference.
  const notImplemented = useCallback(async (..._args: any[]): Promise<any> => {
      console.warn("This feature is a placeholder and not implemented on-chain yet.");
      alert("This feature is coming soon and requires on-chain programs to be deployed.");
      return Promise.resolve({ success: false, messageKey: 'coming_soon_title'});
  }, []);

  const value = useMemo(() => ({
    connected,
    address,
    userTokens,
    loading,
    connection,
    userStats,
    stakedBalance: 0,
    earnedRewards: 0,
    connectWallet,
    disconnectWallet: disconnect,
    getWalletBalances,
    sendTransaction,
    stakeTokens: notImplemented,
    unstakeTokens: notImplemented,
    claimRewards: notImplemented,
    claimVestedTokens: notImplemented,
    voteOnProposal: notImplemented,
  }), [
    connected, address, userTokens, loading, connection, userStats,
    connectWallet, disconnect, getWalletBalances, sendTransaction, notImplemented
  ]);

  return value;
};