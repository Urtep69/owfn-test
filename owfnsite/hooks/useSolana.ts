import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import nacl from 'tweetnacl';
import type { Token, UserNFT, ParsedTransaction } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, HELIUS_RPC_URL, HELIUS_API_KEY } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';

export interface UseSolanaReturn {
  connected: boolean;
  isAuthenticated: boolean;
  address: string | null;
  userTokens: Token[];
  userNfts: UserNFT[];
  userTransactions: ParsedTransaction[];
  solDomain: string | null;
  loading: boolean;
  loadingAdditionalData: boolean;
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
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  getWalletAssets: (walletAddress: string) => Promise<{ tokens: Token[], nfts: UserNFT[] }>;
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

const assetCache = new Map<string, { data: { tokens: Token[], nfts: UserNFT[] }, timestamp: number }>();
const transactionCache = new Map<string, { data: ParsedTransaction[], timestamp: number }>();
const domainCache = new Map<string, { data: string | null, timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const useSolana = (): UseSolanaReturn => {  
  const { connection } = useConnection();
  const { publicKey, connected, signMessage, disconnect, signTransaction } = useWallet();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [userNfts, setUserNfts] = useState<UserNFT[]>([]);
  const [userTransactions, setUserTransactions] = useState<ParsedTransaction[]>([]);
  const [solDomain, setSolDomain] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingAdditionalData, setLoadingAdditionalData] = useState(false);

  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const getWalletAssets = useCallback(async (walletAddress: string): Promise<{ tokens: Token[], nfts: UserNFT[] }> => {
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
        const allNfts: UserNFT[] = [];

        if (result.nativeBalance?.lamports > 0) {
            const pricePerSol = result.nativeBalance.price_per_sol || 0;
            const balance = result.nativeBalance.lamports / LAMPORTS_PER_SOL;
            allTokens.push({
                mintAddress: 'So11111111111111111111111111111111111111112',
                balance: balance,
                decimals: 9, name: 'Solana', symbol: 'SOL',
                logo: React.createElement(SolIcon, null),
                pricePerToken: pricePerSol,
                usdValue: result.nativeBalance.total_price || (balance * pricePerSol),
            });
        }

        const splMintsToPrice: string[] = [];
        const fungibleAssets: any[] = [];

        result.items.forEach((asset: any) => {
            if (asset.fungible && asset.token_info?.balance > 0 && !asset.compression?.compressed) {
                fungibleAssets.push(asset);
                splMintsToPrice.push(asset.id);
            } else if (!asset.fungible && !asset.compression?.compressed) {
                 allNfts.push({
                    id: asset.id,
                    name: asset.content?.metadata?.name || 'Unknown NFT',
                    imageUrl: asset.content?.links?.image,
                    collectionName: asset.grouping?.[0]?.group_value,
                    description: asset.content?.metadata?.description,
                });
            }
        });
        
        const initialSplTokens = fungibleAssets.map((asset: any): Token => ({
            mintAddress: asset.id,
            balance: asset.token_info.balance / Math.pow(10, asset.token_info.decimals),
            decimals: asset.token_info.decimals,
            name: asset.content?.metadata?.name || 'Unknown Token',
            symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}..`,
            logo: KNOWN_TOKEN_ICONS[asset.id] || React.createElement(GenericTokenIcon, { uri: asset.content?.links?.image }),
            usdValue: 0, pricePerToken: 0,
        }));
        allTokens.push(...initialSplTokens);

        if (splMintsToPrice.length > 0) {
            try {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${splMintsToPrice.join(',')}`);
                if (!priceRes.ok) throw new Error(`Jupiter API failed`);
                const priceData = await priceRes.json();
                if (priceData.data) {
                    allTokens.forEach(token => {
                        const priceInfo = priceData.data[token.mintAddress];
                        if (priceInfo?.price) {
                            token.pricePerToken = priceInfo.price;
                            token.usdValue = token.balance * priceInfo.price;
                        }
                    });
                }
            } catch (priceError) {
                console.error("Could not fetch token prices from Jupiter API:", priceError);
            }
        }
        
        const sortedTokens = allTokens.sort((a, b) => b.usdValue - a.usdValue);
        const finalData = { tokens: sortedTokens, nfts: allNfts };
        assetCache.set(walletAddress, { data: finalData, timestamp: Date.now() });
        return finalData;

    } catch (error) {
        console.error("Error fetching wallet assets:", error);
        return { tokens: [], nfts: [] };
    } finally {
        setLoading(false);
    }
  }, [connection]);

  const signIn = useCallback(async (): Promise<boolean> => {
    if (!publicKey || !signMessage) {
        console.error("Wallet not connected or signMessage not available");
        return false;
    }
    try {
        const message = new TextEncoder().encode("Sign this message to authenticate with OWFN.\nThis is a free action and will not trigger a transaction.");
        const signature = await signMessage(message);
        const verified = nacl.sign.detached.verify(message, signature, publicKey.toBuffer());
        
        if (verified) {
            setIsAuthenticated(true);
            return true;
        } else {
            console.error("Signature verification failed.");
            setIsAuthenticated(false);
            return false;
        }
    } catch (error) {
        console.error("Sign in error:", error);
        setIsAuthenticated(false);
        return false;
    }
  }, [publicKey, signMessage]);

  const signOut = useCallback(async () => {
    setIsAuthenticated(false);
    assetCache.clear();
    transactionCache.clear();
    domainCache.clear();
    await disconnect();
  }, [disconnect]);

  const fetchUserTransactions = useCallback(async (walletAddress: string): Promise<ParsedTransaction[]> => {
    const cached = transactionCache.get(walletAddress);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }
    try {
        const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${HELIUS_API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        const parsed: ParsedTransaction[] = data.map((tx: any) => ({
            signature: tx.signature,
            timestamp: tx.timestamp,
            description: tx.description,
            type: tx.type,
        }));
        transactionCache.set(walletAddress, { data: parsed, timestamp: Date.now() });
        return parsed;
    } catch (error) {
        console.error("Failed to fetch user transactions:", error);
        return [];
    }
  }, []);

  const fetchSolDomain = useCallback(async (walletAddress: string): Promise<string | null> => {
    const cached = domainCache.get(walletAddress);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }
    try {
        const url = `https://sns-api.bonfida.com/v2/favorite-domain/${walletAddress}`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        const domain = data.result?.domain ? `${data.result.domain}.sol` : null;
        domainCache.set(walletAddress, { data: domain, timestamp: Date.now() });
        return domain;
    } catch (error) {
        console.error("Failed to fetch SOL domain:", error);
        return null;
    }
  }, []);

  useEffect(() => {
    if (connected && address && isAuthenticated) {
        setLoading(true);
        setLoadingAdditionalData(true);

        getWalletAssets(address).then(({ tokens, nfts }) => {
            setUserTokens(tokens);
            setUserNfts(nfts);
        }).finally(() => setLoading(false));

        Promise.all([
            fetchUserTransactions(address),
            fetchSolDomain(address)
        ]).then(([transactions, domain]) => {
            setUserTransactions(transactions);
            setSolDomain(domain);
        }).finally(() => setLoadingAdditionalData(false));

    } else {
      if (!connected) {
          setIsAuthenticated(false);
      }
      setUserTokens([]);
      setUserNfts([]);
      setUserTransactions([]);
      setSolDomain(null);
    }
  }, [connected, address, isAuthenticated, getWalletAssets, fetchUserTransactions, fetchSolDomain]);

 const sendTransaction = useCallback(async (to: string, amount: number, tokenSymbol: string): Promise<{ success: boolean; messageKey: string; signature?: string; params?: Record<string, string | number>}> => {
    if (!connected || !publicKey || !isAuthenticated) return { success: false, messageKey: 'connect_wallet_first' };
    
    if (!signTransaction) {
        console.error("Wallet does not support signing transactions.");
        return { success: false, messageKey: 'transaction_failed_alert' };
    }

    setLoading(true);
    try {
        const toPublicKey = new PublicKey(to);
        const instructions: TransactionInstruction[] = [];
        if (tokenSymbol === 'SOL') {
            instructions.push(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: toPublicKey, lamports: Math.round(amount * LAMPORTS_PER_SOL) }));
        } else {
            const mintAddress = KNOWN_TOKEN_MINT_ADDRESSES[tokenSymbol];
            if (!mintAddress) throw new Error(`Unknown token: ${tokenSymbol}`);
            const mintPublicKey = new PublicKey(mintAddress);
            const tokenInfo = userTokens.find(t => t.symbol === tokenSymbol);
            if (!tokenInfo) throw new Error(`Token ${tokenSymbol} not found`);
            const transferAmount = BigInt(Math.round(amount * Math.pow(10, tokenInfo.decimals)));
            const fromTokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
            const toTokenAccount = await getAssociatedTokenAddress(mintPublicKey, toPublicKey);
            try {
                await getAccount(connection, toTokenAccount, 'confirmed');
            } catch (e) {
                instructions.push(createAssociatedTokenAccountInstruction(publicKey, toTokenAccount, toPublicKey, mintPublicKey));
            }
            instructions.push(createTransferInstruction(fromTokenAccount, toTokenAccount, publicKey, transferAmount));
        }
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        const messageV0 = new TransactionMessage({ payerKey: publicKey, recentBlockhash: blockhash, instructions }).compileToV0Message();
        const transaction = new VersionedTransaction(messageV0);
        const signedTransaction = await signTransaction(transaction);
        const signature = await connection.sendTransaction(signedTransaction, { skipPreflight: false });
        await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature }, 'finalized');

        if (address) assetCache.delete(address);
        return { success: true, signature, messageKey: 'transaction_success_alert', params: { amount, tokenSymbol } };
    } catch (error) {
        console.error("Transaction failed:", error);
        return { success: false, messageKey: 'transaction_failed_alert' };
    } finally {
        setLoading(false);
        if (connected && address && isAuthenticated) {
            getWalletAssets(address).then(({ tokens, nfts }) => {
                setUserTokens(tokens);
                setUserNfts(nfts);
            });
        }
    }
  }, [connected, publicKey, connection, isAuthenticated, userTokens, address, getWalletAssets, signTransaction]);
  
  const notImplemented = async (..._args: any[]): Promise<any> => {
      console.warn("This feature is a placeholder and not implemented on-chain yet.");
      alert("This feature is coming soon and requires on-chain programs to be deployed.");
      return Promise.resolve({ success: false, messageKey: 'coming_soon_title'});
  }

  return {
    connected,
    isAuthenticated,
    address,
    userTokens,
    userNfts,
    userTransactions,
    solDomain,
    loading,
    loadingAdditionalData,
    connection,
    userStats: { totalDonated: 0, projectsSupported: 0, votesCast: 0, donations: [], votedProposalIds: [] },
    stakedBalance: 0,
    earnedRewards: 0,
    signIn,
    signOut,
    getWalletAssets,
    sendTransaction,
    stakeTokens: notImplemented,
    unstakeTokens: notImplemented,
    claimRewards: notImplemented,
    claimVestedTokens: notImplemented,
    voteOnProposal: notImplemented,
  };
};