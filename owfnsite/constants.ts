import type { TokenAllocation, RoadmapPhase, Language, SocialCase, VestingSchedule, PresaleTransaction, TokenDetails, LiveTransaction } from './types.ts';
import React from 'react';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from './components/IconComponents.tsx';


export const OWFN_MINT_ADDRESS = 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B';
export const OWFN_LOGO_URL = 'https://www.owfn.org/owfn.png';
export const ADMIN_WALLET_ADDRESS = '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy'; // Admin wallet
export const MAINTENANCE_MODE_ACTIVE = false; // Set to true to enable maintenance mode globally

export const HELIUS_API_KEY = 'a37ba545-d429-43e3-8f6d-d51128c49da9';
export const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
export const HELIUS_API_BASE_URL = 'https://api.helius.xyz';


export const TOKEN_DETAILS = {
  totalSupply: 18_000_000_000,
  decimals: 9,
  standard: 'SPL Token 2022',
  extensions: 'Transfer Fee (0.5%), Interest-Bearing (2% APR)',
  presalePrice: '1 SOL = 10,000,000 OWFN',
  dexLaunchPrice: '1 SOL = 8,000,000 OWFN',
};

export const DISTRIBUTION_WALLETS = {
  presale: '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy',
  impactTreasury: 'HJBKht6wRZYNC7ChJc4TbE8ugT5c3QX6buSbEPNYX1k6',
  community: 'EAS2AHoiQkFQsAA7MafifoeAik9BiNNAeAcpiLZZj1fn',
  team: 'Ku2VLgYsVeoUnksyj7CunAEubsJHwU8VpdeBmAEfLfq', // Preserved original team wallet
  marketing: '3kuRooixcDGcz9yuSi6QbCzuqe2Ud5mtsiy3b6M886Ex',
  advisors: '6UokF7FtGK4FXz5Hdr2jm146yC5WqyKkByV5L8fAeAW2',
};

export const PROJECT_LINKS = {
  website: 'https://www.owfn.org/',
  x: 'https://x.com/OWFN_Official',
  telegramGroup: 'https://t.me/OWFNOfficial',
  telegramChannel: 'https://t.me/OWFN_Official',
  discord: 'https://discord.gg/DzHm5HCqDW',
};

export const TOKEN_ALLOCATIONS: TokenAllocation[] = [
  { name: 'Impact Treasury & Social Initiatives', value: 6300000000, percentage: 35, color: '#b89b74' },
  { name: 'Community & Ecosystem Growth', value: 5400000000, percentage: 30, color: '#9e825c' },
  { name: 'Presale & Liquidity', value: 2880000000, percentage: 16, color: '#eac06a' },
  { name: 'Team & Founders', value: 270000000, percentage: 15, color: '#f0d090' },
  { name: 'Marketing & Business Development', value: 540000000, percentage: 3, color: '#d2b48c' },
  { name: 'Advisors & Partnerships', value: 180000000, percentage: 1, color: '#846944' },
];

export const ROADMAP_DATA: RoadmapPhase[] = [
  { quarter: 'Q3 2025', key_prefix: 'roadmap_q3_2025' },
  { quarter: 'Q4 2025', key_prefix: 'roadmap_q4_2025' },
  { quarter: 'Q1 2026', key_prefix: 'roadmap_q1_2026' },
  { quarter: 'Q2 2026 & Beyond', key_prefix: 'roadmap_q2_2026' },
];

export const PRESALE_DETAILS = {
  softCap: 50,
  hardCap: 180,
  minBuy: 0,
  maxBuy: 5,
  rate: 10000000,
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
};

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export const INITIAL_SOCIAL_CASES: SocialCase[] = [];

export const KNOWN_TOKEN_MINT_ADDRESSES: { [key: string]: string } = {
  OWFN: 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B',
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};

export const MOCK_TOKEN_DETAILS: { [symbol: string]: TokenDetails } = {
    'OWFN': {
        name: 'Official World Family Network',
        symbol: 'OWFN',
        mintAddress: OWFN_MINT_ADDRESS,
        logo: React.createElement(OwfnIcon),
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 9,
        description: {
            en: 'OWFN (Official World Family Network) is a Solana-based token designed to unite families globally through blockchain technology, focusing on social impact, education, health, and humanitarian aid with full transparency.',
            // Add other languages as needed
        },
        security: { isMutable: false, mintAuthorityRevoked: true, freezeAuthorityRevoked: true },
        marketCap: 0,
        volume24h: 0,
        price24hChange: 0,
        holders: 0,
        circulatingSupply: 0,
        poolCreated: '2024-07-20',
        dextScore: { score: 99, maxScore: 99, points: [20, 25, 20, 20, 14] },
        audit: { contractVerified: true, isHoneypot: false, isFreezable: false, isMintable: false, alerts: 0 },
        communityTrust: { positiveVotes: 1200, negativeVotes: 50, tradeCount: 1, totalTrades: 1250 },
        pairAddress: '8Vq82rQfT2nqzH8c4g8x9a2avp13aWv12t1nCvZ5X3qg',
    },
    'SOL': {
        name: 'Solana',
        symbol: 'SOL',
        mintAddress: 'So11111111111111111111111111111111111111112',
        logo: React.createElement(SolIcon),
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 9,
        description: { en: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.' },
        security: { isMutable: false, mintAuthorityRevoked: true, freezeAuthorityRevoked: true },
        marketCap: 0,
        volume24h: 0,
        price24hChange: 0,
        holders: 0,
        circulatingSupply: 0,
        poolCreated: 'N/A',
        pairAddress: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqbAaGgG9pFSzsG6', // SOL/USDC
    },
     'USDC': {
        name: 'USD Coin',
        symbol: 'USDC',
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
        logo: React.createElement(UsdcIcon),
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 6,
        description: { en: 'USDC is a fully collateralized US dollar stablecoin. It is an Ethereum-powered coin and is the product of a collaboration between Circle and Coinbase.' },
        security: { isMutable: false, mintAuthorityRevoked: false, freezeAuthorityRevoked: false },
        marketCap: 0,
        volume24h: 0,
        price24hChange: 0,
        holders: 0,
        circulatingSupply: 0,
        poolCreated: 'N/A',
        pairAddress: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqbAaGgG9pFSzsG6', // SOL/USDC
    },
     'USDT': {
        name: 'Tether',
        symbol: 'USDT',
        mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        logo: React.createElement(UsdtIcon),
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 6,
        description: { en: 'Tether (USDT) is a stablecoin pegged to the U.S. dollar. It is issued by the Hong Kong-based company Tether Limited.' },
        security: { isMutable: false, mintAuthorityRevoked: false, freezeAuthorityRevoked: false },
        marketCap: 0,
        volume24h: 0,
        price24hChange: 0,
        holders: 0,
        circulatingSupply: 0,
        poolCreated: 'N/A',
        pairAddress: '7xKXtg2CW87d97TXJSD40M5M5gajNdkgdsDEsMmL2trn', // SOL/USDT
    }
};