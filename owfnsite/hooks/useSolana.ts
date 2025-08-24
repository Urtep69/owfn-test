
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, QUICKNODE_RPC_URL, PRESALE_DETAILS } from '../constants.ts';
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

const balanceCache = new Map<string, { data: Token[], timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

let jupiterTokenListCache: any[] | null = null;
let lastJupiterFetch = 0;
const JUPITER_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const getJupiterTokenList = async () => {
    if (jupiterTokenListCache && (Date.now() - lastJupiterFetch < JUPITER_CACHE_DURATION)) {
        return jupiterTokenListCache;
    }
    try {
        const response = await fetch('https://token.jup.ag/all');
        if (!response.ok) throw new Error('Failed to fetch Jupiter token list');
        jupiterTokenListCache = await response.json();
        lastJupiterFetch = Date.now();
        return jupiterTokenListCache;
    } catch (error) {
        console.error("Failed to get Jupiter token list:", error);
        return jupiterTokenListCache; // Return old cache if available
    }
};

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
        const ownerPublicKey = new PublicKey(walletAddress);
        const allTokens: Token[] = [];
        const mintsToFetchPrice = new Set<string>();
        const tokenList = await getJupiterTokenList() || [];
        const tokenMap = new Map(tokenList.map(t => [t.address, t]));
        
        // 1. Fetch native SOL balance
        const solBalanceLamports = await connection.getBalance(ownerPublicKey);
        if (solBalanceLamports > 0) {
             mintsToFetchPrice.add('So11111111111111111111111111111111111111112');
        }
        allTokens.push({
            mintAddress: 'So11111111111111111111111111111111111111112',
            balance: solBalanceLamports / LAMPORTS_PER_SOL,
            decimals: 9,
            name: 'Solana',
            symbol: 'SOL',
            logo: React.createElement(SolIcon, null),
            pricePerToken: 0,
            usdValue: 0,
        });


        // 2. Fetch SPL token accounts using a standard RPC call
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
            programId: TOKEN_PROGRAM_ID,
        });

        tokenAccounts.value.forEach(accountInfo => {
            const { parsed } = accountInfo.account.data;
            const mintAddress = parsed.info.mint;
            const tokenAmount = parsed.info.tokenAmount;

            if (tokenAmount.uiAmount > 0) {
                 mintsToFetchPrice.add(mintAddress);
            }
            
            const tokenMetadata = tokenMap.get(mintAddress);
            
            allTokens.push({
                mintAddress: mintAddress,
                balance: tokenAmount.uiAmount,
                decimals: tokenAmount.decimals,
                name: tokenMetadata?.name || 'Unknown Token',
                symbol: tokenMetadata?.symbol || `${mintAddress.slice(0, 4)}..`,
                logo: React.createElement(GenericTokenIcon, { uri: tokenMetadata?.logoURI }),
                pricePerToken: 0,
                usdValue: 0,
            });
        });

        // 3. Batch fetch prices for all tokens with a balance
        if (mintsToFetchPrice.size > 0) {
            try {
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${Array.from(mintsToFetchPrice).join(',')}`);
                if (!priceRes.ok) throw new Error(`Jupiter API failed with status ${priceRes.status}`);
                
                const priceData = await priceRes.json();
                
                if (priceData.data) {
                     allTokens.forEach(token => {
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
        
        // 4. Override with known icons for major tokens for consistency
         const KNOWN_TOKEN_ICONS: { [mint: string]: React.ReactNode } = {
            [OWFN_MINT_ADDRESS]: React.createElement(OwfnIcon, null),
            'So11111111111111111111111111111111111111112': React.createElement(SolIcon, null),
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a': React.createElement(UsdcIcon, null),
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': React.createElement(UsdtIcon, null),
        };

        allTokens.forEach(token => {
            if (KNOWN_TOKEN_ICONS[token.mintAddress]) {
                token.logo = KNOWN_TOKEN_ICONS[token.mintAddress];
            }
        });
        
        const tokensWithBalance = allTokens.filter(t => t.balance > 0.000001); // Filter out dust balances
        const sortedTokens = tokensWithBalance.sort((a,b) => b.usdValue - a.usdValue);
        balanceCache.set(walletAddress, { data: sortedTokens, timestamp: Date.now() });
        return sortedTokens;

    } catch (error) {
        console.error("Error fetching wallet balances:", error);
        return []; // Return empty array on critical failure
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
            balanceCache.delete(address); // Invalidate cache after sending
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
