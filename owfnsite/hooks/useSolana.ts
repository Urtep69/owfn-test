import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES } from '../constants.ts';
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

        // 1. Fetch SOL balance
        const solBalance = await connection.getBalance(ownerAddress);
        const solToken: Token = {
            mintAddress: 'So11111111111111111111111111111111111111112',
            balance: solBalance / LAMPORTS_PER_SOL,
            name: 'Solana',
            symbol: 'SOL',
            logo: React.createElement(SolIcon, null),
            usdValue: 0,
            pricePerToken: 0,
            decimals: 9,
        };

        // 2. Fetch SPL token balances using a standard and reliable method
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerAddress, {
            programId: TOKEN_PROGRAM_ID,
        });

        const splTokens: Token[] = tokenAccounts.value
            .filter(accountInfo => {
                const parsedInfo = accountInfo.account.data.parsed.info;
                return parsedInfo.tokenAmount.uiAmount > 0;
            })
            .map(accountInfo => {
                const parsedInfo = accountInfo.account.data.parsed.info;
                const mintAddress = parsedInfo.mint;

                const knownTokenSymbol = Object.keys(KNOWN_TOKEN_MINT_ADDRESSES).find(
                    key => KNOWN_TOKEN_MINT_ADDRESSES[key] === mintAddress
                );
                
                return {
                    mintAddress: mintAddress,
                    balance: parsedInfo.tokenAmount.uiAmount,
                    decimals: parsedInfo.tokenAmount.decimals,
                    name: knownTokenSymbol || 'Unknown Token',
                    symbol: knownTokenSymbol || `${mintAddress.slice(0, 4)}..${mintAddress.slice(-4)}`,
                    logo: KNOWN_TOKEN_ICONS[mintAddress] || React.createElement(GenericTokenIcon, {}),
                    usdValue: 0,
                    pricePerToken: 0,
                };
            });

        const allTokens = [solToken, ...splTokens];

        // 3. Fetch prices from Jupiter API for all tokens at once
        if (allTokens.length > 0) {
            const mints = allTokens.map(t => t.mintAddress).join(',');
            
            try {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${mints}`);
                if (!priceRes.ok) {
                    throw new Error(`Jupiter API failed with status ${priceRes.status}`);
                }
                const priceData = await priceRes.json();

                if (priceData.data) {
                    allTokens.forEach(token => {
                        if (priceData.data[token.mintAddress]) {
                            const price = priceData.data[token.mintAddress].price;
                            token.pricePerToken = price || 0;
                            token.usdValue = token.balance * (price || 0);
                        }
                    });
                } else {
                     console.warn("No price data returned from Jupiter API for mints:", mints, priceData);
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
  }, [connection]);

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
