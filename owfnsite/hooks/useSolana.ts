import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import type { Token, Nft } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, HELIUS_RPC_URL, PRESALE_DETAILS } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';
import bs58 from 'bs58';

// --- TYPE DEFINITION FOR THE HOOK'S RETURN VALUE ---
export interface UseSolanaReturn {
  connected: boolean;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  address: string | null;
  userTokens: Token[];
  userNFTs: Nft[];
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
  fetchWalletAssets: (walletAddress: string) => Promise<{ tokens: Token[], nfts: Nft[] }>;
  sendTransaction: (to: string, amount: number, tokenSymbol: string) => Promise<{ success: boolean; messageKey: string; signature?: string; params?: Record<string, string | number> }>;
  signIn: () => Promise<boolean>;
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

const assetCache = new Map<string, { data: { tokens: Token[], nfts: Nft[] }, timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useSolana = (): UseSolanaReturn => {  
  const { connection } = useConnection();
  const { publicKey, connected, signMessage, sendTransaction: walletSendTransaction, signTransaction, disconnect } = useWallet();
  
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [userNFTs, setUserNFTs] = useState<Nft[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const disconnectWallet = useCallback(async () => {
      setIsAuthenticated(false);
      sessionStorage.removeItem('owfn-auth-token');
      await disconnect();
  }, [disconnect]);

  useEffect(() => {
    // On address change (connect/disconnect), reset auth status
    setIsAuthenticated(false);
    sessionStorage.removeItem('owfn-auth-token');
    // Attempt to re-validate session if a public key exists
    if (publicKey) {
        const token = sessionStorage.getItem('owfn-auth-token');
        if (token === publicKey.toBase58()) {
            setIsAuthenticated(true);
        }
    }
  }, [publicKey]);

  const fetchWalletAssets = useCallback(async (walletAddress: string): Promise<{ tokens: Token[], nfts: Nft[] }> => {
    const cached = assetCache.get(walletAddress);
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
                        showNonFungible: true,
                    },
                },
            }),
        });
        
        if (!response.ok) throw new Error('Failed to fetch assets from Helius');

        const { result } = await response.json();
        
        if (!result || !result.items) return { tokens: [], nfts: [] };
       
        const allTokens: Token[] = [];

        // Process native SOL balance
        if (result.nativeBalance && result.nativeBalance.lamports > 0) {
            const pricePerSol = result.nativeBalance.price_per_sol || 0;
            const balance = result.nativeBalance.lamports / LAMPORTS_PER_SOL;
            allTokens.push({
                mintAddress: 'So11111111111111111111111111111111111111112',
                balance: balance, decimals: 9, name: 'Solana', symbol: 'SOL',
                logo: React.createElement(SolIcon, null),
                pricePerToken: pricePerSol,
                usdValue: result.nativeBalance.total_price || (balance * pricePerSol),
            });
        }
        
        const splTokens = result.items
            .filter((asset: any) => asset.interface === 'FungibleToken' && asset.token_info?.balance > 0 && !asset.compression?.compressed)
            .map((asset: any): Token => ({
                mintAddress: asset.id,
                balance: asset.token_info.balance / Math.pow(10, asset.token_info.decimals),
                decimals: asset.token_info.decimals,
                name: asset.content?.metadata?.name || 'Unknown Token',
                symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}..`,
                logo: KNOWN_TOKEN_ICONS[asset.id] || React.createElement(GenericTokenIcon, { uri: asset.content?.links?.image }),
                usdValue: 0, pricePerToken: 0,
            }));
        allTokens.push(...splTokens);
        
        const nfts: Nft[] = result.items
            .filter((asset: any) => asset.interface === 'V1_NFT' && !asset.compression?.compressed)
            .map((asset: any): Nft => ({
                id: asset.id,
                name: asset.content?.metadata?.name || 'Unknown NFT',
                imageUrl: asset.content?.links?.image,
                collectionName: asset.grouping?.[0]?.group_value || 'N/A'
            }));

        const splMintsToFetch = splTokens.map(t => t.mintAddress).join(',');
        if (splMintsToFetch) {
            try {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${splMintsToFetch}`);
                if (!priceRes.ok) throw new Error(`Jupiter API failed`);
                const priceData = await priceRes.json();
                if (priceData.data) {
                     allTokens.forEach(token => {
                        if (priceData.data[token.mintAddress]) {
                            const price = priceData.data[token.mintAddress].price;
                            token.pricePerToken = price;
                            token.usdValue = token.balance * price;
                        }
                    });
                }
            } catch (priceError) {
                console.warn("Could not fetch token prices:", priceError);
            }
        }
        
        const sortedTokens = allTokens.sort((a,b) => b.usdValue - a.usdValue);
        const assets = { tokens: sortedTokens, nfts };
        assetCache.set(walletAddress, { data: assets, timestamp: Date.now() });
        return assets;

    } catch (error) {
        console.error("Error fetching wallet assets:", error);
        return { tokens: [], nfts: [] };
    } finally {
        setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    if (connected && address) {
      fetchWalletAssets(address).then(({tokens, nfts}) => {
          setUserTokens(tokens);
          setUserNFTs(nfts);
      });
    } else {
      setUserTokens([]);
      setUserNFTs([]);
      assetCache.clear();
    }
  }, [connected, address, fetchWalletAssets]);

 const sendTransaction = useCallback(async (to: string, amount: number, tokenSymbol: string): Promise<{ success: boolean; messageKey: string; signature?: string; params?: Record<string, string | number>}> => {
    if (!isAuthenticated || !publicKey || !signTransaction) {
      return { success: false, messageKey: 'connect_wallet_first' };
    }
    setLoading(true);

    try {
        const toPublicKey = new PublicKey(to);
        const instructions: TransactionInstruction[] = [];
        
        if (tokenSymbol === 'SOL') {
            instructions.push(
                SystemProgram.transfer({
                    fromPubkey: publicKey, toPubkey: toPublicKey,
                    lamports: Math.round(amount * LAMPORTS_PER_SOL),
                })
            );
        } else {
            const mintAddress = KNOWN_TOKEN_MINT_ADDRESSES[tokenSymbol];
            if (!mintAddress) throw new Error(`Unknown token: ${tokenSymbol}`);
            const mintPublicKey = new PublicKey(mintAddress);
            const tokenInfo = userTokens.find(t => t.symbol === tokenSymbol);
            if (!tokenInfo) throw new Error(`Token ${tokenSymbol} not found.`);
            
            const fromTokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
            const toTokenAccount = await getAssociatedTokenAddress(mintPublicKey, toPublicKey);
            
            try {
                await getAccount(connection, toTokenAccount);
            } catch (e) {
                instructions.push(
                    createAssociatedTokenAccountInstruction(publicKey, toTokenAccount, toPublicKey, mintPublicKey)
                );
            }
            instructions.push(
                createTransferInstruction(fromTokenAccount, toTokenAccount, publicKey, BigInt(Math.round(amount * Math.pow(10, tokenInfo.decimals))))
            );
        }

        const latestBlockHash = await connection.getLatestBlockhash('finalized');
        const messageV0 = new TransactionMessage({
            payerKey: publicKey, recentBlockhash: latestBlockHash.blockhash, instructions,
        }).compileToV0Message();
        const transaction = new VersionedTransaction(messageV0);
        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendTransaction(signedTransaction);
        await connection.confirmTransaction({ signature, ...latestBlockHash }, 'finalized');
        
        console.log(`Transaction successful: ${signature}`);
        setLoading(false);
        if (address) {
            assetCache.delete(address);
            fetchWalletAssets(address).then(({tokens, nfts}) => {
                setUserTokens(tokens);
                setUserNFTs(nfts);
            });
        }
        return { success: true, signature, messageKey: 'transaction_success_alert', params: { amount, tokenSymbol } };

    } catch (error) {
        console.error("Transaction failed:", error);
        setLoading(false);
        return { success: false, messageKey: 'transaction_failed_alert' };
    }
  }, [isAuthenticated, publicKey, connection, signTransaction, userTokens, address, fetchWalletAssets]);
  
  const signIn = useCallback(async (): Promise<boolean> => {
      if (!publicKey || !signMessage) {
          console.error("Wallet not connected or does not support signMessage");
          return false;
      }
      setIsAuthLoading(true);
      try {
          const message = new TextEncoder().encode(`Sign this message to authenticate with OWFN.\n\nTimestamp: ${new Date().toISOString()}`);
          const signature = await signMessage(message);
          // In a real app, you'd send the signature and public key to a backend for verification.
          // Here, we just verify the signature locally for demonstration.
          // This is NOT secure for production authentication but demonstrates the flow.
          // For a real app, use a proper SIWS library or backend verification.
          
          // MOCK VERIFICATION
          if (signature) {
             setIsAuthenticated(true);
             sessionStorage.setItem('owfn-auth-token', publicKey.toBase58());
             console.log("Authentication successful (mocked)");
             return true;
          }
          throw new Error("Signature failed");
      } catch (error) {
          console.error("Sign-in failed:", error);
          setIsAuthenticated(false);
          sessionStorage.removeItem('owfn-auth-token');
          return false;
      } finally {
          setIsAuthLoading(false);
      }
  }, [publicKey, signMessage]);

  const notImplemented = async (..._args: any[]): Promise<any> => {
      console.warn("This feature is a placeholder and not implemented on-chain yet.");
      alert("This feature is coming soon and requires on-chain programs to be deployed.");
      return Promise.resolve({ success: false, messageKey: 'coming_soon_title'});
  }

  return {
    connected,
    isAuthenticated,
    isAuthLoading,
    address,
    userTokens,
    userNFTs,
    loading,
    connection,
    userStats: { 
        totalDonated: 0, projectsSupported: 0, votesCast: 0,
        donations: [], votedProposalIds: []
    },
    stakedBalance: 0,
    earnedRewards: 0,
    disconnectWallet,
    fetchWalletAssets,
    sendTransaction,
    signIn,
    stakeTokens: notImplemented,
    unstakeTokens: notImplemented,
    claimRewards: notImplemented,
    claimVestedTokens: notImplemented,
    voteOnProposal: notImplemented,
  };
};