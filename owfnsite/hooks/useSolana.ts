import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import type { Token, GovernanceProposal } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, QUICKNODE_RPC_URL, PRESALE_DETAILS } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';
import { Buffer } from 'buffer-es6';

// --- TYPE DEFINITION FOR THE HOOK'S RETURN VALUE ---
export interface UseSolanaReturn {
  connected: boolean;
  connecting: boolean;
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
  voteOnProposal: (proposalId: number, vote: 'for' | 'against') => Promise<{ success: boolean; messageKey: string; updatedProposal?: GovernanceProposal }>;
  checkAirdropStatus: () => Promise<{ hasSubmitted: boolean }>;
  submitAirdropMessage: (message: string) => Promise<{ success: boolean, messageKey: string }>;
  createProposal: (title: string, description: string) => Promise<{ success: boolean; messageKey: string; newProposal?: GovernanceProposal }>;
}

const balanceCache = new Map<string, { data: Token[], timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const isValidSolanaAddress = (address: any): boolean => {
    if (typeof address !== 'string') return false;
    try {
        new PublicKey(address);
        return true;
    } catch (e) {
        return false;
    }
};

export const useSolana = (): UseSolanaReturn => {  
  const { connection } = useConnection();
  const { publicKey, connected, connecting, sendTransaction: walletSendTransaction, signTransaction, disconnect, signMessage } = useWallet();
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ 
        totalDonated: 0,
        projectsSupported: 0,
        votesCast: 0,
        donations: [],
        votedProposalIds: [] as string[]
    });

  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const signArbitraryMessage = useCallback(async (message: string) => {
    if (!connected || !publicKey || !signMessage) {
      console.error('Wallet not connected or does not support signing');
      return null;
    }
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      return { signature: Buffer.from(signature).toString('base64') };
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  }, [connected, publicKey, signMessage]);

  const getWalletBalances = useCallback(async (walletAddress: string): Promise<Token[]> => {
    const cached = balanceCache.get(walletAddress);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }
      
    setLoading(true);
    try {
        const ownerPublicKey = new PublicKey(walletAddress);
        let allTokens: Token[] = [];
        const mintsToFetchPrice = new Set<string>();

        const solBalanceLamports = await connection.getBalance(ownerPublicKey);
        if (solBalanceLamports > 0) {
            mintsToFetchPrice.add('So11111111111111111111111111111111111111112');
            allTokens.push({
                mintAddress: 'So11111111111111111111111111111111111111112',
                balance: solBalanceLamports / LAMPORTS_PER_SOL,
                decimals: 9,
                name: 'Solana',
                symbol: 'SOL',
                logo: React.createElement(SolIcon),
                pricePerToken: 0,
                usdValue: 0,
            });
        }

        const tokenAccountsPromise = connection.getParsedTokenAccountsByOwner(ownerPublicKey, { programId: TOKEN_PROGRAM_ID });
        const token2022AccountsPromise = connection.getParsedTokenAccountsByOwner(ownerPublicKey, { programId: TOKEN_2022_PROGRAM_ID });
        const [tokenAccounts, token2022Accounts] = await Promise.all([tokenAccountsPromise, token2022AccountsPromise]);
        
        const allTokenAccounts = [...tokenAccounts.value, ...token2022Accounts.value];
        
        const splTokens: Token[] = allTokenAccounts
            .map(accountInfo => accountInfo.account.data?.parsed?.info)
            .filter(parsedInfo => parsedInfo && isValidSolanaAddress(parsedInfo.mint) && BigInt(parsedInfo.tokenAmount.amount) > 0n)
            .map(parsedInfo => {
                mintsToFetchPrice.add(parsedInfo.mint);
                return {
                    mintAddress: parsedInfo.mint,
                    balance: Number(BigInt(parsedInfo.tokenAmount.amount)) / (10 ** parsedInfo.tokenAmount.decimals),
                    decimals: parsedInfo.tokenAmount.decimals,
                    name: 'Unknown Token',
                    symbol: `${parsedInfo.mint.slice(0, 4)}...`,
                    logo: React.createElement(GenericTokenIcon),
                    pricePerToken: 0,
                    usdValue: 0,
                };
            });

        allTokens = [...allTokens, ...splTokens];

        let priceData: any = {};
        if (mintsToFetchPrice.size > 0) {
            try {
                const res = await fetch('/api/token-prices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mints: Array.from(mintsToFetchPrice) }),
                });
                if (res.ok) priceData = await res.json();
            } catch (priceError) {
                console.error("Could not fetch token prices:", priceError);
            }
        }
        
        allTokens.forEach(token => {
            const data = priceData[token.mintAddress];
            if (data) {
                token.name = data.name || 'Unknown Token';
                token.symbol = data.symbol || `${token.mintAddress.slice(0, 4)}...`;
                token.logo = React.createElement(GenericTokenIcon, { uri: data.logoURI });
                token.pricePerToken = data.price || 0;
                token.usdValue = token.balance * (data.price || 0);
                token.decimals = data.decimals ?? token.decimals;
            }
        });
        
         const KNOWN_TOKEN_ICONS: { [mint: string]: React.ReactNode } = {
            [OWFN_MINT_ADDRESS]: React.createElement(OwfnIcon),
            'So11111111111111111111111111111111111111112': React.createElement(SolIcon),
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a': React.createElement(UsdcIcon),
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': React.createElement(UsdtIcon),
        };

        allTokens.forEach(token => {
            if (KNOWN_TOKEN_ICONS[token.mintAddress]) token.logo = KNOWN_TOKEN_ICONS[token.mintAddress];
            if (token.mintAddress === OWFN_MINT_ADDRESS) {
                token.name = 'Official World Family Network';
                token.symbol = 'OWFN';
            }
        });
        
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
      // Fetch user's voting history
      fetch(`/api/governance?walletAddress=${address}`)
        .then(res => res.json())
        .then(data => {
            if (data.votedProposalIds) {
                 setUserStats(prev => ({...prev, votedProposalIds: data.votedProposalIds}));
            }
        })
        .catch(err => console.error("Failed to fetch user votes:", err));

    } else {
      setUserTokens([]);
      setUserStats({ totalDonated: 0, projectsSupported: 0, votesCast: 0, donations: [], votedProposalIds: [] });
      balanceCache.clear();
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
            const mintAddress = Object.keys(KNOWN_TOKEN_MINT_ADDRESSES).find(key => key === tokenSymbol && KNOWN_TOKEN_MINT_ADDRESSES[key]);
            if (!mintAddress) throw new Error(`Unknown token symbol: ${tokenSymbol}`);
            
            const mintPublicKey = new PublicKey(KNOWN_TOKEN_MINT_ADDRESSES[tokenSymbol]);
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
  
  const checkAirdropStatus = useCallback(async (): Promise<{ hasSubmitted: boolean }> => {
    if (!connected || !address) return { hasSubmitted: false };
    try {
        const res = await fetch(`/api/airdrop-submission?walletAddress=${address}`);
        if (!res.ok) return { hasSubmitted: false };
        const data = await res.json();
        return { hasSubmitted: data.hasSubmitted };
    } catch (e) {
        console.error("Failed to check airdrop status", e);
        return { hasSubmitted: false };
    }
  }, [connected, address]);

  const submitAirdropMessage = useCallback(async (message: string): Promise<{ success: boolean; messageKey: string }> => {
    if (!connected || !address) return { success: false, messageKey: 'connect_wallet_first' };
    setLoading(true);
    try {
        const signableMessage = "I am submitting my application for the OWFN Family Airdrop.";
        const signed = await signArbitraryMessage(signableMessage);
        if (!signed) return { success: false, messageKey: 'transaction_failed_alert' };

        const res = await fetch('/api/airdrop-submission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                walletAddress: address,
                message: message,
                signature: signed.signature,
                signedMessage: signableMessage,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit');
        return { success: true, messageKey: 'airdrop_submit_success' };
    } catch (e) {
        console.error("Airdrop submission failed:", e);
        return { success: false, messageKey: 'airdrop_submit_error' };
    } finally {
        setLoading(false);
    }
  }, [connected, address, signArbitraryMessage]);
  
  const voteOnProposal = useCallback(async (proposalId: number, vote: 'for' | 'against'): Promise<{ success: boolean; messageKey: string; updatedProposal?: GovernanceProposal }> => {
    if (!connected || !address) return { success: false, messageKey: 'connect_wallet_first' };
    setLoading(true);
    try {
        const signableMessage = `I am voting '${vote}' on OWFN proposal #${proposalId}.`;
        const signed = await signArbitraryMessage(signableMessage);
        if (!signed) return { success: false, messageKey: 'transaction_failed_alert' };
        
        const res = await fetch('/api/governance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'vote',
                proposalId,
                voterAddress: address,
                choice: vote,
                signature: signed.signature,
                signedMessage: signableMessage,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to vote');
        
        setUserStats(prev => ({ ...prev, votedProposalIds: [...prev.votedProposalIds, String(proposalId)] }));
        return { success: true, messageKey: 'vote_success_alert', updatedProposal: data.updatedProposal };
    } catch (e) {
        console.error("Vote failed:", e);
        return { success: false, messageKey: 'vote_failed_alert' };
    } finally {
        setLoading(false);
    }
  }, [connected, address, signArbitraryMessage]);

  const createProposal = useCallback(async (title: string, description: string): Promise<{ success: boolean; messageKey: string; newProposal?: GovernanceProposal }> => {
    if (!connected || !address) return { success: false, messageKey: 'connect_wallet_first' };
    setLoading(true);
    try {
        const signableMessage = `I am creating a new OWFN proposal with the title: ${title}`;
        const signed = await signArbitraryMessage(signableMessage);
        if (!signed) return { success: false, messageKey: 'transaction_failed_alert' };

        const res = await fetch('/api/governance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create',
                proposerAddress: address,
                title,
                description,
                signature: signed.signature,
                signedMessage: signableMessage,
            }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create proposal');

        return { success: true, messageKey: 'proposal_create_success', newProposal: data.newProposal };
    } catch(e) {
        console.error("Proposal creation failed:", e);
        return { success: false, messageKey: 'proposal_create_error' };
    } finally {
        setLoading(false);
    }
  }, [connected, address, signArbitraryMessage]);

  const notImplemented = async (..._args: any[]): Promise<any> => {
      console.warn("This feature is a placeholder and not implemented on-chain yet.");
      alert("This feature is coming soon and requires on-chain programs to be deployed.");
      return Promise.resolve({ success: false, messageKey: 'coming_soon_title'});
  }

  return {
    connected,
    connecting,
    address,
    userTokens,
    loading,
    connection,
    userStats,
    stakedBalance: 0,
    earnedRewards: 0,
    disconnectWallet: disconnect,
    getWalletBalances,
    sendTransaction,
    checkAirdropStatus,
    submitAirdropMessage,
    voteOnProposal,
    createProposal,
    stakeTokens: notImplemented,
    unstakeTokens: notImplemented,
    claimRewards: notImplemented,
    claimVestedTokens: notImplemented,
  };
};