import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, HELIUS_API_KEY, PRESALE_DETAILS } from '../constants.ts';
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
        const ownerPublicKey = new PublicKey(walletAddress);

        // Helius API URL
        const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
        
        // Fetch all assets (fungible tokens and native SOL) in one call
        const response = await fetch(url, {
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
                        showFungible: true, // Fetch SPL tokens
                        showNativeBalance: true, // Fetch SOL balance
                    },
                },
            }),
        });
        
        if (!response.ok) {
            console.error('Helius API Error:', await response.text());
            throw new Error('Failed to fetch assets from Helius');
        }

        const { result } = await response.json();
        
        if (!result || !result.items) {
             return []; // Return empty if no assets found
        }
       
        let rawTokens: Token[] = result.items
            .filter((asset: any) => 
                (asset.interface === 'V1_NFT' && asset.content?.metadata?.name) || // Basic check for fungible-like NFTs
                (asset.interface === 'FungibleToken' && asset.token_info?.balance > 0 && !asset.compression?.compressed) ||
                (asset.nativeBalance && asset.nativeBalance.lamports > 0)
            )
            .map((asset: any) => {
                if (asset.nativeBalance) { // Handling SOL
                    return {
                        mintAddress: 'So11111111111111111111111111111111111111112',
                        balance: asset.nativeBalance.lamports / LAMPORTS_PER_SOL,
                        decimals: 9,
                        name: 'Solana',
                        symbol: 'SOL',
                        logo: React.createElement(SolIcon, null),
                        usdValue: 0,
                        pricePerToken: 0,
                    };
                }
                // Handling SPL Tokens
                return {
                    mintAddress: asset.id,
                    balance: asset.token_info.balance / Math.pow(10, asset.token_info.decimals),
                    decimals: asset.token_info.decimals,
                    name: asset.content?.metadata?.name || 'Unknown Token',
                    symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}..`,
                    logo: KNOWN_TOKEN_ICONS[asset.id] || React.createElement(GenericTokenIcon, { uri: asset.content?.links?.image }),
                    usdValue: 0,
                    pricePerToken: 0,
                };
            });
        
        // Filter out tokens with zero balance just in case
        let allTokens = rawTokens.filter(token => token.balance > 0);

        if (allTokens.length === 0) return [];

        // Fetch prices robustly from Jupiter API
        let solPrice = 0;
        const allMints = allTokens.map(t => t.mintAddress).join(',');
        try {
            const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${allMints}`);
            if (!priceRes.ok) throw new Error(`Jupiter API failed with status ${priceRes.status}`);
            
            const priceData = await priceRes.json();
            
            if (priceData.data) {
                 allTokens.forEach(token => {
                    const priceInfo = priceData.data[token.mintAddress];
                    if (priceInfo && priceInfo.price) {
                        const price = priceInfo.price;
                        token.pricePerToken = price;
                        token.usdValue = token.balance * price;

                        if (token.mintAddress === 'So11111111111111111111111111111111111111112') {
                            solPrice = price;
                        }
                    }
                });
            }
        } catch (priceError) {
            console.error("Could not fetch token prices from Jupiter API:", priceError);
        }
        
        // Special handling for OWFN presale price if market price isn't available from API
        const owfnToken = allTokens.find(t => t.mintAddress === OWFN_MINT_ADDRESS);
        if (owfnToken && owfnToken.pricePerToken === 0 && solPrice > 0) {
            const presaleRate = PRESALE_DETAILS.rate; // 10,000,000 OWFN per SOL
            owfnToken.pricePerToken = solPrice / presaleRate;
            owfnToken.usdValue = owfnToken.balance * owfnToken.pricePerToken;
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
