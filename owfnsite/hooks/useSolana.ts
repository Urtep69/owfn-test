import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction, ParsedInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount } from '@solana/spl-token';
import type { Token, PresaleHistoryTransaction, DonationHistoryTransaction } from '../lib/types.js';
import { OWFN_MINT_ADDRESS, KNOWN_TOKEN_MINT_ADDRESSES, QUICKNODE_RPC_URL, PRESALE_STAGES, DISTRIBUTION_WALLETS, TOKEN_DETAILS } from '../lib/constants.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.js';

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
  voteOnProposal: (proposalId: string, vote: 'for' | 'against') => Promise<any>;
  getPresaleHistory: () => Promise<PresaleHistoryTransaction[]>;
  getDonationHistory: () => Promise<DonationHistoryTransaction[]>;
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
  const { publicKey, connected, connecting, sendTransaction: walletSendTransaction, signTransaction, disconnect } = useWallet();
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

        // 1. Fetch native SOL balance and only add it if it's greater than zero.
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
        
        const splTokens: Token[] = [];
        allTokenAccounts.forEach(accountInfo => {
            const parsedInfo = accountInfo.account.data?.parsed?.info;
            if (!parsedInfo || !isValidSolanaAddress(parsedInfo.mint)) {
                console.warn('Skipping token account with invalid or missing mint address:', parsedInfo?.mint);
                return;
            }

            const rawAmount = BigInt(parsedInfo.tokenAmount.amount);
            if (rawAmount === 0n) {
                return;
            }

            const mintAddress = parsedInfo.mint;
            mintsToFetchPrice.add(mintAddress);
            
            const decimals = parsedInfo.tokenAmount.decimals;
            const divisor = 10n ** BigInt(decimals);
            const balance = Number(rawAmount) / Number(divisor);

            splTokens.push({
                mintAddress,
                balance: balance,
                decimals: decimals,
                name: 'Unknown Token',
                symbol: `${mintAddress.slice(0, 4)}...`,
                logo: React.createElement(GenericTokenIcon, { uri: undefined }),
                pricePerToken: 0,
                usdValue: 0,
            });
        });

        allTokens = [...allTokens, ...splTokens];

        // 3. Batch fetch metadata and prices from our server-side API route for reliability
        let priceData: any = {};
        if (mintsToFetchPrice.size > 0) {
            try {
                const res = await fetch('/api/token-prices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mints: Array.from(mintsToFetchPrice) }),
                });
                if (res.ok) {
                    priceData = await res.json();
                } else {
                    console.warn(`Token prices API route failed with status ${res.status}`);
                }
            } catch (priceError) {
                console.error("Could not fetch token prices from API route:", priceError);
            }
        }
        
        // 4. Populate token data with the fetched prices and metadata
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
        
        // 5. Override with known data for consistency
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
    } else {
      setUserTokens([]);
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
  
  const getPresaleHistory = useCallback(async (): Promise<PresaleHistoryTransaction[]> => {
    if (!publicKey) return [];

    const history: PresaleHistoryTransaction[] = [];
    const solPrice = userTokens.find(t => t.symbol === 'SOL')?.pricePerToken ?? 0;

    for (const stage of PRESALE_STAGES) {
      if (!stage.distributionWallet) continue;
      
      const presaleWallet = new PublicKey(stage.distributionWallet);
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
      const relevantSignatures = signatures.filter(sig => sig.blockTime && sig.blockTime >= new Date(stage.startDate).getTime() / 1000 && sig.blockTime < new Date(stage.endDate).getTime() / 1000);
      
      if(relevantSignatures.length > 0) {
        const transactions = await connection.getParsedTransactions(relevantSignatures.map(s => s.signature), { maxSupportedTransactionVersion: 0 });
        transactions.forEach((tx, index) => {
          if (tx) {
            tx.transaction.message.instructions.forEach(inst => {
              const isParsedInstruction = (i: any): i is ParsedInstruction => 'parsed' in i;
              if (isParsedInstruction(inst) && inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === stage.distributionWallet) {
                const solAmount = inst.parsed.info.lamports / LAMPORTS_PER_SOL;
                const baseOwfn = solAmount * stage.rate;
                const applicableTier = [...stage.bonusTiers].sort((a,b) => b.threshold - a.threshold).find(tier => solAmount >= tier.threshold);
                const bonusPercentage = applicableTier ? applicableTier.percentage : 0;
                const bonusOwfn = baseOwfn * (bonusPercentage / 100);
                const totalOwfn = baseOwfn + bonusOwfn;
                
                history.push({
                  phase: stage.phase,
                  signature: relevantSignatures[index].signature,
                  timestamp: tx.blockTime! * 1000,
                  solAmount: solAmount,
                  owfnAmount: totalOwfn,
                  usdValue: solAmount * solPrice,
                });
              }
            });
          }
        });
      }
    }
    return history.sort((a, b) => b.timestamp - a.timestamp);
  }, [publicKey, connection, userTokens]);

  const getDonationHistory = useCallback(async (): Promise<DonationHistoryTransaction[]> => {
     if (!publicKey) return [];
     
     const history: DonationHistoryTransaction[] = [];
     const donationWallet = new PublicKey(DISTRIBUTION_WALLETS.impactTreasury);
     const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
     
     if(signatures.length > 0) {
        const transactions = await connection.getParsedTransactions(signatures.map(s => s.signature), { maxSupportedTransactionVersion: 0 });
        for (const [index, tx] of transactions.entries()) {
            if (tx) {
                for (const inst of tx.transaction.message.instructions) {
                    const isParsedInstruction = (i: any): i is ParsedInstruction => 'parsed' in i;
                    if (!isParsedInstruction(inst)) continue;

                    let donation: Omit<DonationHistoryTransaction, 'signature' | 'timestamp'> | null = null;
                    
                    // SOL Donations
                    if (inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === donationWallet.toBase58()) {
                        const solAmount = inst.parsed.info.lamports / LAMPORTS_PER_SOL;
                        const solPrice = userTokens.find(t => t.symbol === 'SOL')?.pricePerToken ?? 0;
                        donation = { tokenSymbol: 'SOL', amount: solAmount, usdValue: solAmount * solPrice };
                    }
                    // SPL Token Donations
                    else if (inst.program === 'spl-token' && (inst.parsed?.type === 'transfer' || inst.parsed?.type === 'transferChecked') && inst.parsed.info.authority === publicKey.toBase58()) {
                        const destinationAta = new PublicKey(inst.parsed.info.destination);
                        for (const [symbol, mint] of Object.entries(KNOWN_TOKEN_MINT_ADDRESSES)) {
                            if (symbol === 'SOL') continue;
                            const expectedAta = await getAssociatedTokenAddress(new PublicKey(mint), donationWallet);
                            if (destinationAta.equals(expectedAta)) {
                                const amount = inst.parsed.info.tokenAmount.uiAmount;
                                const tokenPrice = userTokens.find(t => t.symbol === symbol)?.pricePerToken ?? 0;
                                donation = { tokenSymbol: symbol, amount: amount, usdValue: amount * tokenPrice };
                                break;
                            }
                        }
                    }

                    if (donation) {
                        history.push({
                            ...donation,
                            signature: signatures[index].signature,
                            timestamp: tx.blockTime! * 1000,
                        });
                    }
                }
            }
        }
     }
     return history.sort((a, b) => b.timestamp - a.timestamp);
  }, [publicKey, connection, userTokens]);

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
    getPresaleHistory,
    getDonationHistory,
  };
};