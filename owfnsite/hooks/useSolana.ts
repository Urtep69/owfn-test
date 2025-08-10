
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, HELIUS_RPC_URL } from '../constants.ts';
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

export const useSolana = (): UseSolanaReturn => {  
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction: walletSendTransaction, signTransaction } = useWallet();
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
    setLoading(true);
    try {
        const ownerAddress = new PublicKey(walletAddress);
        const heliusConnection = new Connection(HELIUS_RPC_URL, 'confirmed');

        const [solBalanceRes, assetsRes] = await Promise.all([
             heliusConnection.getBalance(ownerAddress),
             fetch(HELIUS_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'get-assets-by-owner',
                    method: 'getAssetsByOwner',
                    params: { ownerAddress: walletAddress, page: 1, limit: 1000 },
                }),
            })
        ]);
        
        const assetsData = await assetsRes.json();
        
        const solToken: Token = {
            mintAddress: 'So11111111111111111111111111111111111111112',
            balance: solBalanceRes / LAMPORTS_PER_SOL,
            name: 'Solana',
            symbol: 'SOL',
            logo: React.createElement(SolIcon, null),
            usdValue: 0,
            decimals: 9,
        };

        if (!assetsData.result || !assetsData.result.items) {
            console.warn("Failed to fetch token assets from Helius for wallet:", walletAddress, assetsData.error || '');
            const allTokensOnError = [solToken];
             try {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${solToken.mintAddress}`);
                const priceData = await priceRes.json();
                if (priceData.data?.[solToken.mintAddress]) {
                    solToken.usdValue = solToken.balance * priceData.data[solToken.mintAddress].price;
                }
            } catch(e) { console.error("Price fetch failed on error path", e)}
            return allTokensOnError;
        }
        
        const splTokens: Token[] = assetsData.result.items
            .filter((asset: any) => (asset.interface === 'FungibleToken' || asset.interface === 'FungibleAsset') && asset.token_info?.balance > 0)
            .map((asset: any) => {
                const metadata = asset.content?.metadata;
                const links = asset.content?.links;
                const mint = asset.id;

                return {
                    mintAddress: mint,
                    balance: Number(asset.token_info.balance) / Math.pow(10, asset.token_info.decimals),
                    decimals: asset.token_info.decimals,
                    name: metadata?.name || 'Unknown Token',
                    symbol: metadata?.symbol || `${mint.slice(0, 4)}..${mint.slice(-4)}`,
                    logo: KNOWN_TOKEN_ICONS[mint] || React.createElement(GenericTokenIcon, { uri: links?.image }),
                    usdValue: 0,
                };
            });

        const allTokens = [solToken, ...splTokens];
        if (allTokens.length > 0) {
            const mints = allTokens.map(t => t.mintAddress).join(',');
            
            try {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${mints}`);
                const priceData = await priceRes.json();

                if (priceData.data) {
                    allTokens.forEach(token => {
                        if (priceData.data[token.mintAddress]) {
                            token.usdValue = token.balance * priceData.data[token.mintAddress].price;
                        }
                    });
                }
            } catch (priceError) {
                console.error("Could not fetch token prices from Jupiter API:", priceError);
            }
        }
        
        return allTokens.sort((a,b) => b.usdValue - a.usdValue);

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
    }
  }, [connected, address, getWalletBalances]);

  const sendTransaction = useCallback(async (to: string, amount: number, tokenSymbol: string): Promise<{ success: boolean; messageKey: string; signature?: string; params?: Record<string, string | number>}> => {
    if (!connected || !publicKey) {
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
                    lamports: amount * LAMPORTS_PER_SOL,
                })
            );
        } else {
            const mintAddress = KNOWN_TOKEN_MINT_ADDRESSES[tokenSymbol];
            if (!mintAddress) throw new Error(`Unknown token symbol: ${tokenSymbol}`);

            const mintPublicKey = new PublicKey(mintAddress);
            const tokenInfo = userTokens.find(t => t.symbol === tokenSymbol);
            if (!tokenInfo) throw new Error(`Token ${tokenSymbol} not found in user's wallet.`);
            
            const decimals = tokenInfo.decimals;

            const fromTokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
            const toTokenAccount = await getAssociatedTokenAddress(mintPublicKey, toPublicKey);
            
            transaction.add(
                createTransferInstruction(
                    fromTokenAccount,
                    toTokenAccount,
                    publicKey,
                    amount * Math.pow(10, decimals) 
                )
            );
        }

        const signature = await walletSendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'processed');

        console.log(`Transaction successful with signature: ${signature}`);
        setLoading(false);
        // Refetch balances after successful transaction
        getWalletBalances(address!).then(setUserTokens);
        return { success: true, signature, messageKey: 'transaction_success_alert', params: { amount, tokenSymbol } };

    } catch (error) {
        console.error("Transaction failed:", error);
        setLoading(false);
        return { success: false, messageKey: 'transaction_failed_alert' };
    }
  }, [connected, publicKey, connection, walletSendTransaction, userTokens, address, getWalletBalances]);
  
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
    connectWallet,
    getWalletBalances,
    sendTransaction,
    stakeTokens: notImplemented,
    unstakeTokens: notImplemented,
    claimRewards: notImplemented,
    claimVestedTokens: notImplemented,
    voteOnProposal: notImplemented,
  };
};
