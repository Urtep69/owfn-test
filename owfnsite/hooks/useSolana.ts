import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import type { Token, ImpactBadge, ImpactNFT, VestingSchedule } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, HELIUS_RPC_URL, PRESALE_DETAILS } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';
import { HandHeart, Vote, Gem, Check, ShieldCheck } from 'lucide-react';

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
    impactScore: number;
    memberTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    impactNFTs: ImpactNFT[];
    impactBadges: ImpactBadge[];
  };
  stakedBalance: number;
  earnedRewards: number;
  connection: Connection;
  disconnectWallet: () => Promise<void>;
  getWalletBalances: (walletAddress: string) => Promise<Token[]>;
  sendTransaction: (to: string, amount: number, tokenSymbol: string) => Promise<{ success: boolean; messageKey: string; signature?: string; params?: Record<string, string | number> }>;
  stakeTokens: (amount: number) => Promise<{ success: boolean; messageKey: string; params?: { amount: number } }>;
  unstakeTokens: (amount: number) => Promise<{ success: boolean; messageKey: string; params?: { amount: number } }>;
  claimRewards: () => Promise<{ success: boolean; messageKey: string; params?: { amount: number } }>;
  claimVestedTokens: (amount: number) => Promise<any>;
  voteOnProposal: (proposalId: string, vote: 'for' | 'against') => Promise<{ success: boolean; messageKey: string }>;
  signMessage: (message: string) => Promise<Uint8Array | null>;
}

const KNOWN_TOKEN_ICONS: { [mint: string]: React.ReactNode } = {
    [OWFN_MINT_ADDRESS]: React.createElement(OwfnIcon, null),
    'So11111111111111111111111111111111111111112': React.createElement(SolIcon, null),
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a': React.createElement(UsdcIcon, null),
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': React.createElement(UsdtIcon, null),
};

const balanceCache = new Map<string, { data: Token[], timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: React.createElement(HandHeart) },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: React.createElement(Vote) },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: React.createElement(Gem) },
    { id: 'badge4', titleKey: 'badge_verified_human', descriptionKey: 'badge_verified_human_desc', icon: React.createElement(ShieldCheck) },
];


export const useSolana = (): UseSolanaReturn => {  
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction: walletSendTransaction, signTransaction, signMessage: walletSignMessage, disconnect } = useWallet();
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<UseSolanaReturn['userStats']>({
        totalDonated: 0,
        projectsSupported: 0,
        votesCast: 0,
        donations: [],
        votedProposalIds: [],
        impactScore: 0,
        memberTier: 'Bronze',
        impactNFTs: [],
        impactBadges: MOCK_BADGES, // Using mock badges for now
  });
  const [stakedBalance, setStakedBalance] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState(0);

  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const signMessage = useCallback(async (message: string) => {
    if (!walletSignMessage) {
      console.error('Wallet does not support signMessage');
      return null;
    }
    try {
      const encodedMessage = new TextEncoder().encode(message);
      return await walletSignMessage(encodedMessage);
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  }, [walletSignMessage]);
  
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
  }, [connection]);

    // Calculate Impact Score and Tier based on tokens
    useEffect(() => {
        if (connected && address) {
            const owfnToken = userTokens.find(t => t.symbol === 'OWFN');
            const solToken = userTokens.find(t => t.symbol === 'SOL');

            // More advanced scoring logic
            const score = (owfnToken?.balance || 0) * 0.1 + (solToken?.balance || 0) * 10 + (userStats.votesCast * 50) + (userStats.totalDonated * 2);
            let tier: UseSolanaReturn['userStats']['memberTier'] = 'Bronze';
            if (score > 10000) tier = 'Platinum';
            else if (score > 5000) tier = 'Gold';
            else if (score > 1000) tier = 'Silver';
            
            setUserStats(prev => ({ ...prev, impactScore: Math.round(score), memberTier: tier }));
        } else {
            setUserStats(prev => ({ ...prev, impactScore: 0, memberTier: 'Bronze' }));
        }
    }, [userTokens, connected, address, userStats.votesCast, userStats.totalDonated]);


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
  
  const stakeTokens = async (amount: number): Promise<{ success: boolean; messageKey: string; params?: { amount: number } }> => {
    console.warn("This feature is a placeholder and not implemented on-chain yet.");
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate transaction
    setStakedBalance(prev => prev + amount);
    // In a real scenario, you'd update the user's OWFN token balance too
    setLoading(false);
    return Promise.resolve({ success: true, messageKey: 'stake_success_alert', params: { amount } });
  };
  
  const unstakeTokens = async (amount: number): Promise<{ success: boolean; messageKey: string; params?: { amount: number } }> => {
    console.warn("This feature is a placeholder and not implemented on-chain yet.");
    if (amount > stakedBalance) {
        alert("Cannot unstake more than you have staked.");
        return Promise.resolve({ success: false, messageKey: 'transaction_failed_alert' });
    }
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate transaction
    setStakedBalance(prev => prev - amount);
    setLoading(false);
    return Promise.resolve({ success: true, messageKey: 'unstake_success_alert', params: { amount } });
  };
  
  const claimRewards = async (): Promise<{ success: boolean; messageKey: string; params?: { amount: number } }> => {
    console.warn("This feature is a placeholder and not implemented on-chain yet.");
    const amount = earnedRewards;
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000)); // Simulate transaction
    setEarnedRewards(0);
    setLoading(false);
    return Promise.resolve({ success: true, messageKey: 'claim_success_alert', params: { amount } });
  };

  const voteOnProposal = async (proposalId: string, vote: 'for' | 'against'): Promise<{ success: boolean; messageKey: string }> => {
      console.warn("This feature is a placeholder and not implemented on-chain yet.");
       setLoading(true);
       await new Promise(res => setTimeout(res, 1000));
       setUserStats(prev => ({
            ...prev,
            votedProposalIds: [...prev.votedProposalIds, proposalId],
            votesCast: prev.votesCast + 1,
       }));
       setLoading(false);
       return Promise.resolve({ success: true, messageKey: 'vote_success_alert' });
  };
  
  const claimVestedTokens = async (amount: number): Promise<any> => {
    console.warn("This feature is a placeholder and not implemented on-chain yet.");
    setLoading(true);
    await new Promise(res => setTimeout(res, 1000));
    setLoading(false);
    return Promise.resolve({ success: true, messageKey: 'vesting_claim_success', params: { amount }});
  }

  return {
    connected,
    address,
    userTokens,
    loading,
    connection,
    userStats,
    stakedBalance,
    earnedRewards,
    disconnectWallet: disconnect,
    getWalletBalances,
    sendTransaction,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    voteOnProposal,
    claimVestedTokens,
    signMessage,
  };
};