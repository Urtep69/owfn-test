// Fix: Import React to use React.createElement for creating components without JSX.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount } from '@solana/spl-token';
import type { Token, UserStats } from '../lib/types.js';
import { KNOWN_TOKEN_MINT_ADDRESSES, OWFN_MINT_ADDRESS } from '../lib/constants.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from '../components/IconComponents.js';

const MOCK_USER_STATS: UserStats = {
    stakedBalance: 0,
    earnedRewards: 0,
    votedProposalIds: [],
};

const getTokenIcon = (symbol: string) => {
    switch (symbol) {
        // Fix: Replaced JSX with React.createElement to be valid in a .ts file.
        case 'OWFN': return React.createElement(OwfnIcon);
        // Fix: Replaced JSX with React.createElement to be valid in a .ts file.
        case 'SOL': return React.createElement(SolIcon);
        // Fix: Replaced JSX with React.createElement to be valid in a .ts file.
        case 'USDC': return React.createElement(UsdcIcon);
        // Fix: Replaced JSX with React.createElement to be valid in a .ts file.
        case 'USDT': return React.createElement(UsdtIcon);
        // Fix: Replaced JSX with React.createElement to be valid in a .ts file.
        default: return React.createElement(GenericTokenIcon);
    }
}

export const useSolana = () => {
    const { connection } = useConnection();
    const { publicKey, connected, connecting, sendTransaction, disconnect, signTransaction } = useWallet();
    const [userTokens, setUserTokens] = useState<Token[]>([]);
    const [totalUsdValue, setTotalUsdValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userStats, setUserStats] = useState<UserStats>(MOCK_USER_STATS);

    const address = useMemo(() => publicKey?.toBase58() || null, [publicKey]);

    const getWalletBalances = useCallback(async (walletAddress: string): Promise<Token[]> => {
        const walletPublicKey = new PublicKey(walletAddress);
        const balances: Token[] = [];
    
        // 1. Get SOL balance
        const solBalanceLamports = await connection.getBalance(walletPublicKey);
        
        // 2. Get all token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletPublicKey, {
            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        });

        // 3. Create list of all mints (SOL + SPL)
        const mints = ['So11111111111111111111111111111111111111112', ...tokenAccounts.value.map(acc => acc.account.data.parsed.info.mint)];
        
        // 4. Fetch prices for all mints in one go
        let prices: Record<string, any> = {};
        try {
            const priceResponse = await fetch('/api/token-prices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mints }),
            });
            if (priceResponse.ok) {
                prices = await priceResponse.json();
            }
        } catch (error) {
            console.error("Failed to fetch token prices:", error);
        }

        // 5. Process SOL balance
        const solPriceInfo = prices['So11111111111111111111111111111111111111112'] || { price: 0 };
        const solBalance = solBalanceLamports / LAMPORTS_PER_SOL;
        balances.push({
            mintAddress: 'So11111111111111111111111111111111111111112',
            symbol: 'SOL',
            name: 'Solana',
            balance: solBalance,
            pricePerToken: solPriceInfo.price,
            usdValue: solBalance * solPriceInfo.price,
            // Fix: Replaced JSX with React.createElement to be valid in a .ts file.
            logo: React.createElement(SolIcon),
            decimals: 9,
        });

        // 6. Process SPL token balances
        for (const { account } of tokenAccounts.value) {
            const { mint, tokenAmount } = account.data.parsed.info;
            const priceInfo = prices[mint] || { price: 0, name: 'Unknown', symbol: mint.slice(0, 4), logoURI: null, decimals: tokenAmount.decimals };
            const balance = tokenAmount.uiAmount;
            const usdValue = balance * priceInfo.price;
            
            balances.push({
                mintAddress: mint,
                symbol: priceInfo.symbol,
                name: priceInfo.name,
                balance: balance,
                pricePerToken: priceInfo.price,
                usdValue,
                logo: getTokenIcon(priceInfo.symbol),
                decimals: tokenAmount.decimals,
            });
        }
        
        return balances.sort((a, b) => b.usdValue - a.usdValue);
    }, [connection]);

    useEffect(() => {
        const fetchUserBalances = async () => {
            if (connected && publicKey) {
                setLoading(true);
                const balances = await getWalletBalances(publicKey.toBase58());
                setUserTokens(balances);
                setTotalUsdValue(balances.reduce((sum, token) => sum + token.usdValue, 0));
                setLoading(false);
            } else {
                setUserTokens([]);
                setTotalUsdValue(0);
            }
        };

        fetchUserBalances();
        const interval = setInterval(fetchUserBalances, 60000); // Refresh every 60 seconds
        return () => clearInterval(interval);

    }, [connected, publicKey, getWalletBalances]);
    
    const disconnectWallet = useCallback(() => {
        disconnect().catch(e => console.error("Error during disconnect:", e));
    }, [disconnect]);

    const sendSolanaTransaction = async (to: string, amount: number, tokenSymbol: string) => {
        if (!publicKey || !signTransaction) {
            return { success: false, messageKey: 'wallet_not_connected_error' };
        }
        setLoading(true);
        try {
            const toPublicKey = new PublicKey(to);
            const transaction = new Transaction();
            let instructions: TransactionInstruction[] = [];

            if (tokenSymbol === 'SOL') {
                instructions.push(
                    SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: toPublicKey,
                        lamports: amount * LAMPORTS_PER_SOL,
                    })
                );
            } else {
                const mintAddress = Object.entries(KNOWN_TOKEN_MINT_ADDRESSES).find(([symbol]) => symbol === tokenSymbol)?.[1];
                if (!mintAddress) {
                    return { success: false, messageKey: 'unsupported_token_error', params: { symbol: tokenSymbol } };
                }
                const mintPublicKey = new PublicKey(mintAddress);
                const fromAta = await getAssociatedTokenAddress(mintPublicKey, publicKey);
                const toAta = await getAssociatedTokenAddress(mintPublicKey, toPublicKey);

                try {
                    await getAccount(connection, toAta);
                } catch (error) {
                    instructions.push(
                        createAssociatedTokenAccountInstruction(publicKey, toAta, toPublicKey, mintPublicKey)
                    );
                }
                
                const token = userTokens.find(t => t.symbol === tokenSymbol);
                const amountInSmallestUnit = BigInt(Math.round(amount * (10 ** (token?.decimals ?? 9))));

                instructions.push(
                    createTransferInstruction(fromAta, toAta, publicKey, amountInSmallestUnit)
                );
            }

            transaction.add(...instructions);
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;
            
            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, 'processed');

            return { success: true, signature, messageKey: 'transaction_successful', params: { signature } };
        } catch (error: any) {
            console.error("Transaction error:", error);
            return { success: false, messageKey: 'transaction_failed_error', params: { error: error.message } };
        } finally {
            setLoading(false);
        }
    };
    
    // MOCK FUNCTIONS for features that need a backend/program
    const mockAction = async (messageKey: string, params?: any) => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 1500)); // Simulate async
        setLoading(false);
        return { success: true, messageKey, params };
    };

    const stakeTokens = (amount: number) => mockAction('stake_success_alert', { amount });
    const unstakeTokens = (amount: number) => mockAction('unstake_success_alert', { amount });
    const claimRewards = () => mockAction('claim_success_alert', { amount: userStats.earnedRewards });
    const claimVestedTokens = (amount: number) => mockAction('vesting_claim_success', { amount });
    const voteOnProposal = (proposalId: string, vote: 'for' | 'against') => {
        const newStats = { ...userStats, votedProposalIds: [...userStats.votedProposalIds, proposalId] };
        setUserStats(newStats);
        return mockAction('vote_success_alert');
    };


    return {
        connected,
        connecting,
        address,
        disconnectWallet,
        sendTransaction: sendSolanaTransaction,
        getWalletBalances,
        userTokens,
        totalUsdValue,
        loading,
        userStats,
        stakedBalance: userStats.stakedBalance,
        earnedRewards: userStats.earnedRewards,
        stakeTokens,
        unstakeTokens,
        claimRewards,
        voteOnProposal,
        claimVestedTokens,
    };
};