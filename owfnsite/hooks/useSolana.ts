
import React, { useState, useCallback, useEffect } from 'react';
import type { Token } from '../types.ts';
import { OWFN_MINT_ADDRESS, ADMIN_WALLET_ADDRESS, HELIUS_RPC_URL } from '../constants.ts';
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
  connectWallet: (isAdmin?: boolean) => Promise<void>;
  disconnectWallet: () => void;
  getWalletBalances: (walletAddress: string) => Promise<Token[]>;
  sendTransaction: (to: string, amount: number, tokenSymbol: string) => Promise<{ success: boolean; messageKey: string; params?: Record<string, string | number> }>;
  stakeTokens: (amount: number) => Promise<any>;
  unstakeTokens: (amount: number) => Promise<any>;
  claimRewards: () => Promise<any>;
  claimVestedTokens: (amount: number) => Promise<any>;
  voteOnProposal: (proposalId: string, vote: 'for' | 'against') => Promise<any>;
}


// --- LIVE DATA HOOK ---
// This hook interacts with the Helius RPC and Jupiter API for live Solana data.

const MOCK_USER_ADDRESS = 'Am3R8zL7qV9k3yP5tW1sX4nB6mJ7fG9cE2dF8hK0gR'; // Example user wallet address
const MOCK_ADMIN_ADDRESS = ADMIN_WALLET_ADDRESS;

const KNOWN_TOKEN_ICONS: { [mint: string]: React.ReactNode } = {
    [OWFN_MINT_ADDRESS]: <OwfnIcon />,
    'So11111111111111111111111111111111111111112': <SolIcon />,
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a': <UsdcIcon />,
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': <UsdtIcon />,
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useSolana = (): UseSolanaReturn => {  
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const getWalletBalances = useCallback(async (walletAddress: string): Promise<Token[]> => {
    setLoading(true);
    try {
        const [solBalanceRes, assetsRes] = await Promise.all([
             fetch(HELIUS_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'get-sol-balance',
                    method: 'getBalance',
                    params: [walletAddress],
                }),
            }),
            fetch(HELIUS_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'get-assets-by-owner',
                    method: 'getAssetsByOwner',
                    params: { ownerAddress: walletAddress, page: 1, limit: 1000 },
                }),
            })
        ]);

        const solData = await solBalanceRes.json();
        const assetsData = await assetsRes.json();

        if (!assetsData.result || !solData.result) {
            console.warn("Failed to fetch data from Helius for wallet:", walletAddress);
            return [];
        }
        
        const splTokens: Token[] = assetsData.result.items
            .filter((asset: any) => asset.interface === 'FungibleToken' && asset.token_info?.balance > 0 && asset.content?.metadata)
            .map((asset: any) => ({
                mintAddress: asset.id,
                balance: Number(asset.token_info.balance) / Math.pow(10, asset.token_info.decimals),
                name: asset.content.metadata.name || 'Unknown Token',
                symbol: asset.content.metadata.symbol || '???',
                logo: KNOWN_TOKEN_ICONS[asset.id] || <GenericTokenIcon uri={asset.content?.links?.image} />,
                usdValue: 0, // will be populated by price API
            }));

        const solToken: Token = {
            mintAddress: 'So11111111111111111111111111111111111111112',
            balance: solData.result.value / 1e9,
            name: 'Solana',
            symbol: 'SOL',
            logo: <SolIcon />,
            usdValue: 0,
        };
        
        const allTokens = [solToken, ...splTokens];
        const mints = allTokens.map(t => t.mintAddress).join(',');
        
        const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${mints}`);
        const priceData = await priceRes.json();

        if (priceData.data) {
             allTokens.forEach(token => {
                if (priceData.data[token.mintAddress]) {
                    token.usdValue = token.balance * priceData.data[token.mintAddress].price;
                }
            });
        }
        
        return allTokens.sort((a,b) => b.usdValue - a.usdValue);

    } catch (error) {
        console.error("Error fetching wallet balances:", error);
        return [];
    } finally {
        setLoading(false);
    }
  }, []);

  const connectWallet = useCallback(async (isAdmin: boolean = false) => {
    setLoading(true);
    await sleep(500);
    const selectedAddress = isAdmin ? MOCK_ADMIN_ADDRESS : MOCK_USER_ADDRESS;
    setAddress(selectedAddress);
    const balances = await getWalletBalances(selectedAddress);
    setUserTokens(balances);
    setConnected(true);
    setLoading(false);
  }, [getWalletBalances]);

  const disconnectWallet = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setUserTokens([]);
  }, []);

  const sendTransaction = useCallback(async (to: string, amount: number, tokenSymbol: string): Promise<{ success: boolean; messageKey: string; params?: Record<string, string | number>}> => {
    if (!connected) {
      return { success: false, messageKey: 'connect_wallet_first' };
    }
    setLoading(true);
    console.log(`Simulating transaction of ${amount} ${tokenSymbol} to ${to}...`);
    await sleep(1500);
    
    if (Math.random() < 0.1) {
        setLoading(false);
        return { success: false, messageKey: 'transaction_failed_alert' };
    }

    setLoading(false);
    return { success: true, messageKey: 'transaction_success_alert', params: { amount, tokenSymbol } };
  }, [connected]);
  
  const notImplemented = async (..._args: any[]): Promise<any> => {
      alert("This feature is coming soon and requires on-chain programs to be deployed.");
      return Promise.reject({ success: false, messageKey: 'coming_soon_title'});
  }

  return {
    connected,
    address,
    userTokens,
    loading,
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
    disconnectWallet,
    getWalletBalances,
    sendTransaction,
    stakeTokens: notImplemented,
    unstakeTokens: notImplemented,
    claimRewards: notImplemented,
    claimVestedTokens: notImplemented,
    voteOnProposal: notImplemented,
  };
};
