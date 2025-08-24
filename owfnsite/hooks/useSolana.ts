import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, QUICKNODE_RPC_URL, PRESALE_DETAILS } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.tsx';

// --- TYPE DEFINITION FOR JUPITER TOKEN LIST ---
interface JupiterToken {
    address: string;
    name: string;
    symbol: string;
    logoURI?: string;
}

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
        let allTokens: Token[] = [];
        const mintsToFetchPrice = new Set<string>();

        // 1. Fetch native SOL balance
        const solBalanceLamports = await connection.getBalance(ownerPublicKey);
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

        // 2. Fetch SPL token accounts for both standards
        const tokenAccountsPromise = connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
            programId: TOKEN_PROGRAM_ID,
        });
        const token2022AccountsPromise = connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
            programId: TOKEN_2022_PROGRAM_ID,
        });

        const [tokenAccounts, token2022Accounts] = await Promise.all([
            tokenAccountsPromise,
            token2022AccountsPromise,
        ]);
        
        const allTokenAccounts = [...tokenAccounts.value, ...token2022Accounts.value];
        
        const splTokens: Token[] = allTokenAccounts.map(accountInfo => {
            const { parsed } = accountInfo.account.data;
            const mintAddress = parsed.info.mint;
            mintsToFetchPrice.add(mintAddress);
            return {
                mintAddress,
                balance: parsed.info.tokenAmount.uiAmount,
                decimals: parsed.info.tokenAmount.decimals,
                name: 'Unknown Token',
                symbol: `${mintAddress.slice(0, 4)}...`,
                logo: React.createElement(GenericTokenIcon, { uri: undefined }),
                pricePerToken: 0,
                usdValue: 0,
            };
        });

        allTokens = [...allTokens, ...splTokens];

        // 3. Batch fetch metadata and prices
        const jupiterTokenList: JupiterToken[] = await (await fetch('https://token.jup.ag/all')).json();
        const tokenMap = new Map(jupiterTokenList.map((t: JupiterToken) => [t.address, t]));

        try {
            const priceRes = await fetch(`https://price.jup.ag/v6/price?ids=${Array.from(mintsToFetchPrice).join(',')}`);
            if (!priceRes.ok) throw new Error(`Jupiter API failed with status ${priceRes.status}`);
            const priceData = await priceRes.json();
            
            allTokens.forEach(token => {
                const metadata = tokenMap.get(token.mintAddress);
                if (metadata) {
                    token.name = metadata.name;
                    token.symbol = metadata.symbol;
                    token.logo = React.createElement(GenericTokenIcon, { uri: metadata.logoURI });
                }

                if (priceData.data && priceData.data[token.mintAddress]) {
                    const price = priceData.data[token.mintAddress].price;
                    token.pricePerToken = price;
                    token.usdValue = token.balance * price;
                }
            });

        } catch (priceError) {
            console.error("Could not fetch token prices from Jupiter API:", priceError);
            // Even if prices fail, we might have metadata, so we continue
            allTokens.forEach(token => {
                 const metadata = tokenMap.get(token.mintAddress);
                if (metadata) {
                    token.name = metadata.name;
                    token.symbol = metadata.symbol;
                    token.logo = React.createElement(GenericTokenIcon, { uri: metadata.logoURI });
                }
            });
        }
        
        // 4. Override with known icons for major tokens for consistency
         const KNOWN_TOKEN_ICONS: { [mint: string]: React.ReactNode } = {
            [OWFN_MINT_ADDRESS]: React.createElement(OwfnIcon),
            'So11111111111111111111111111111111111111112': React.createElement(SolIcon),
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a': React.createElement(UsdcIcon),
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': React.createElement(UsdtIcon),
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