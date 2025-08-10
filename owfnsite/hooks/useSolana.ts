import React, { useState, useCallback, useEffect } from 'react';
import type { Token, Wallet, GovernanceProposal } from '../types.ts';
import { OWFN_MINT_ADDRESS, DISTRIBUTION_WALLETS, ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';

// --- MOCK DATA AND SIMULATION ---
// This hook simulates interactions with the Solana blockchain.
// In a real application, you would replace this with @solana/wallet-adapter and @solana/web3.js.

const MOCK_USER_ADDRESS = '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy'; // Regular user wallet address
const MOCK_ADMIN_ADDRESS = ADMIN_WALLET_ADDRESS;

const MOCK_USER_TOKENS: Token[] = [
  { name: 'OWFN', symbol: 'OWFN', mintAddress: OWFN_MINT_ADDRESS, logo: React.createElement(OwfnIcon), balance: 12500000, usdValue: 150.50 },
  { name: 'Solana', symbol: 'SOL', mintAddress: 'So11111111111111111111111111111111111111112', logo: React.createElement(SolIcon), balance: 2.5, usdValue: 375.21 },
  { name: 'USD Coin', symbol: 'USDC', mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a', logo: React.createElement(UsdcIcon), balance: 542.11, usdValue: 542.11 },
];

const MOCK_USER_STATS = {
    totalDonated: 125.50, // USD
    projectsSupported: 3,
    votesCast: 5,
    donations: [
        { caseId: '1', amount: 50, token: 'USDC' },
        { caseId: '2', amount: 0.25, token: 'SOL' },
        { caseId: '3', amount: 25, token: 'USDC' },
    ],
    votedProposalIds: ['prop1', 'prop3']
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSolana = () => {  
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [userStats, setUserStats] = useState(MOCK_USER_STATS);

  useEffect(() => {
    let interval: any;
    if (connected && stakedBalance > 0) {
      interval = setInterval(() => {
        // Simulate rewards based on 15% APY
        const rewardPerSecond = (stakedBalance * 0.15) / 31536000;
        setEarnedRewards(prev => prev + rewardPerSecond);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connected, stakedBalance]);

  const connectWallet = useCallback(async (isAdmin: boolean = false) => {
    setLoading(true);
    await sleep(500);
    setConnected(true);
    const selectedAddress = isAdmin ? MOCK_ADMIN_ADDRESS : MOCK_USER_ADDRESS;
    setAddress(selectedAddress);
    setUserTokens(MOCK_USER_TOKENS);
    setUserStats(MOCK_USER_STATS);
    // Give some initial staked balance for demonstration
    setStakedBalance(2500000); 
    setEarnedRewards(12345.67);
    setLoading(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setUserTokens([]);
    setStakedBalance(0);
    setEarnedRewards(0);
  }, []);

  const getWalletBalances = useCallback(async (walletAddress: string): Promise<Token[]> => {
    setLoading(true);
    await sleep(700);
    setLoading(false);
    return [
        { name: 'OWFN', symbol: 'OWFN', mintAddress: OWFN_MINT_ADDRESS, logo: React.createElement(OwfnIcon), balance: Math.random() * 1e9, usdValue: Math.random() * 1e5 },
        { name: 'Solana', symbol: 'SOL', mintAddress: 'So11111111111111111111111111111111111111112', logo: React.createElement(SolIcon), balance: Math.random() * 100, usdValue: Math.random() * 15000 },
        { name: 'USD Coin', symbol: 'USDC', mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a', logo: React.createElement(UsdcIcon), balance: Math.random() * 1e6, usdValue: Math.random() * 1e6 },
    ]
  }, []);

  const sendTransaction = useCallback(async (to: string, amount: number, tokenSymbol: string): Promise<{ success: boolean; messageKey: string; params?: Record<string, string | number>}> => {
    if (!connected) {
      return { success: false, messageKey: 'connect_wallet_first' };
    }
    setLoading(true);
    console.log(`Simulating transaction of ${amount} ${tokenSymbol} to ${to}...`);
    await sleep(1500);
    
    // Simulate potential failure
    if (Math.random() < 0.1) { // 10% chance of failure
        setLoading(false);
        console.log("Transaction failed (simulation).");
        return { success: false, messageKey: 'transaction_failed_alert' };
    }

    setLoading(false);
    console.log("Transaction successful (simulation).");
    return { success: true, messageKey: 'transaction_success_alert', params: { amount, tokenSymbol } };
  }, [connected]);

  const stakeTokens = useCallback(async (amount: number): Promise<{ success: boolean; messageKey: string; params?: Record<string, string | number>}> => {
    setLoading(true);
    await sleep(1500);
    setUserTokens(prev => prev.map(t => t.symbol === 'OWFN' ? { ...t, balance: t.balance - amount } : t));
    setStakedBalance(prev => prev + amount);
    setLoading(false);
    return { success: true, messageKey: 'stake_success_alert', params: { amount: amount.toLocaleString() } };
  }, []);

  const unstakeTokens = useCallback(async (amount: number): Promise<{ success: boolean; messageKey: string; params?: Record<string, string | number>}> => {
    setLoading(true);
    await sleep(1500);
    setUserTokens(prev => prev.map(t => t.symbol === 'OWFN' ? { ...t, balance: t.balance + amount } : t));
    setStakedBalance(prev => prev - amount);
    setLoading(false);
    return { success: true, messageKey: 'unstake_success_alert', params: { amount: amount.toLocaleString() } };
  }, []);

  const claimRewards = useCallback(async (): Promise<{ success: boolean; messageKey: string; params?: Record<string, string | number>}> => {
    setLoading(true);
    await sleep(1500);
    const rewardsToClaim = earnedRewards;
    setUserTokens(prev => prev.map(t => t.symbol === 'OWFN' ? { ...t, balance: t.balance + rewardsToClaim } : t));
    setEarnedRewards(0);
    setLoading(false);
    return { success: true, messageKey: 'claim_success_alert', params: { amount: rewardsToClaim.toFixed(4) } };
  }, [earnedRewards]);
  
  const claimVestedTokens = useCallback(async (amount: number): Promise<{ success: boolean; messageKey: string; params?: Record<string, string | number>}> => {
    setLoading(true);
    await sleep(1500);
    setUserTokens(prev => prev.map(t => t.symbol === 'OWFN' ? { ...t, balance: t.balance + amount } : t));
    setLoading(false);
    return { success: true, messageKey: 'vesting_claim_success', params: { amount: amount.toLocaleString() } };
  }, []);
  
  const voteOnProposal = useCallback(async (proposalId: string, vote: 'for' | 'against'): Promise<{ success: boolean; messageKey: string; }> => {
    setLoading(true);
    await sleep(1000);
    setUserStats(prev => ({
        ...prev,
        votedProposalIds: [...prev.votedProposalIds, proposalId]
    }))
    setLoading(false);
    return { success: true, messageKey: 'vote_success_alert' };
  }, []);


  return {
    connected,
    address,
    userTokens,
    loading,
    stakedBalance,
    earnedRewards,
    userStats,
    connectWallet,
    disconnectWallet,
    getWalletBalances,
    sendTransaction,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    claimVestedTokens,
    voteOnProposal,
  };
};
