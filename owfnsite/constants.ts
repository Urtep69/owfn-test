
import type { TokenAllocation, RoadmapPhase, Language, SocialCase, VestingSchedule, PresaleTransaction, TokenDetails } from './types.ts';
import React from 'react';
import { owfnLogo, solanaLogo, usdcLogo, usdtLogo } from './lib/assets.ts';


export const OWFN_MINT_ADDRESS = 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B';
export const OWFN_LOGO_URL: string = owfnLogo;
export const ADMIN_WALLET_ADDRESS = '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy'; // Admin wallet
export const MAINTENANCE_MODE_ACTIVE = false; // Set to true to enable maintenance mode globally

export const HELIUS_API_KEY = 'a37ba545-d429-43e3-8f6d-d51128c49da9';
export const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
export const HELIUS_API_BASE_URL = 'https://api.helius.xyz';

export const BIRDEYE_API_KEY = 'YOUR_BIRDEYE_API_KEY_HERE'; // TODO: Replace with your actual Birdeye API key
export const BIRDEYE_API_BASE_URL = 'https://public-api.birdeye.so';


export const TOKEN_DETAILS = {
  totalSupply: 18_000_000_000,
  decimals: 9,
  standard: 'SPL Token 2022',
  extensions: 'Transfer Fee (0.5% activated after presale concludes), Interest-Bearing (2% APR)',
  presalePrice: '1 SOL = 10,000,000 OWFN',
  dexLaunchPrice: '1 SOL ≈ 6,670,000 OWFN',
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
  { name: 'Team & Founders', value: 2700000000, percentage: 15, color: '#f0d090' },
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
  softCap: 105,
  hardCap: 200,
  minBuy: 0,
  maxBuy: 5,
  rate: 10000000,
  bonusThreshold: 2, // Minimum SOL to get the bonus
  bonusPercentage: 10, // 10% bonus
  startDate: new Date('2025-08-13T00:00:00Z'),
  endDate: new Date('2025-09-12T00:00:00Z')
};

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
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
        logo: owfnLogo,
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 9,
        description: 'OWFN (Official World Family Network) is a Solana-based token designed to unite families globally through blockchain technology, focusing on social impact, education, health, and humanitarian aid with full transparency.',
        totalSupply: 18_000_000_000,
    },
    'SOL': {
        name: 'Solana',
        symbol: 'SOL',
        mintAddress: 'So11111111111111111111111111111111111111112',
        logo: solanaLogo,
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 9,
        description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.',
        totalSupply: 0,
    },
     'USDC': {
        name: 'USD Coin',
        symbol: 'USDC',
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
        logo: usdcLogo,
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 6,
        description: 'USDC is a fully collateralized US dollar stablecoin. It is an Ethereum-powered coin and is the product of a collaboration between Circle and Coinbase.',
        totalSupply: 0,
    },
     'USDT': {
        name: 'Tether',
        symbol: 'USDT',
        mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        logo: usdtLogo,
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 6,
        description: 'Tether (USDT) is a stablecoin pegged to the U.S. dollar. It is issued by the Hong Kong-based company Tether Limited.',
        totalSupply: 0,
    }
};