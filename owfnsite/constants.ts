
import type { TokenAllocation, RoadmapPhase, Language, SocialCase, VestingSchedule, PresaleTransaction, TokenDetails, LiveTransaction } from './types.ts';
import React from 'react';
import { owfnLogo, solanaLogo, usdcLogo, usdtLogo } from './lib/assets.ts';


export const OWFN_MINT_ADDRESS = 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B';
export const OWFN_LOGO_URL: string = owfnLogo;
export const ADMIN_WALLET_ADDRESS = '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy'; // Admin wallet
export const MAINTENANCE_MODE_ACTIVE = false; // Set to true to enable maintenance mode globally

export const QUICKNODE_RPC_URL = 'https://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/';
export const QUICKNODE_WSS_URL = 'wss://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/';


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
  minBuy: 0.1,
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

export const INITIAL_SOCIAL_CASES: SocialCase[] = [
  {
    id: 'case-1',
    title: { en: 'Build a New School in Rural Kenya' },
    description: { en: 'Help us construct a new primary school for 200 children, providing them with a safe and modern learning environment.' },
    details: { en: 'Project includes 4 classrooms, a library, and sanitation facilities. We have partnered with local builders to ensure community involvement and sustainable construction practices.' },
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1594432213904-924a43a05445?q=80&w=1740&auto=format&fit=crop',
    goal: 50000,
    donated: 12500,
    coordinates: [36.706, -1.304], // Nairobi, Kenya area
  },
  {
    id: 'case-2',
    title: { en: 'Provide Clean Water Access in a Village in India' },
    description: { en: 'Fund the installation of a solar-powered water well and purification system to provide clean, safe drinking water for an entire community.' },
    details: { en: 'This project will eliminate the need for women and children to walk several kilometers each day to fetch contaminated water, drastically improving health and freeing up time for education.' },
    category: 'Basic Needs',
    imageUrl: 'https://images.unsplash.com/photo-1598433200924-a4220cde0f13?q=80&w=1740&auto=format&fit=crop',
    goal: 15000,
    donated: 9800,
    coordinates: [78.9629, 20.5937], // Central India
  },
  {
    id: 'case-3',
    title: { en: 'Fund Life-Saving Heart Surgery for a Child' },
    description: { en: 'A young child requires urgent open-heart surgery to correct a congenital defect. Your donation can give them a chance at a healthy life.' },
    details: { en: 'Funds will cover all medical expenses, including the surgical procedure, hospital stay, and post-operative care. We are working directly with the hospital to ensure transparency.' },
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1582719202448-6a3a4835e54c?q=80&w=1740&auto=format&fit=crop',
    goal: 25000,
    donated: 24100,
    coordinates: [-43.2096, -22.9035], // Rio de Janeiro, Brazil area
  },
  {
    id: 'case-4',
    title: { en: 'Emergency Shelter & Food for Disaster Relief' },
    description: { en: 'Provide immediate relief to families displaced by a recent natural disaster, offering temporary shelter, food, and essential supplies.' },
    details: { en: 'This is an ongoing emergency response. Donations are used to purchase tents, blankets, clean water, and non-perishable food items for immediate distribution by our partners on the ground.' },
    category: 'Basic Needs',
    imageUrl: 'https://images.unsplash.com/photo-1623948631118-a35985b5d848?q=80&w=1548&auto=format&fit=crop',
    goal: 100000,
    donated: 45000,
    coordinates: [121.7740, 12.8797], // Philippines area
  },
];

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
        marketCap: 0,
        volume24h: 0,
        price24hChange: 0,
        holders: 0,
        totalSupply: 18_000_000_000,
        circulatingSupply: 0,
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
        marketCap: 0,
        volume24h: 0,
        price24hChange: 0,
        holders: 0,
        totalSupply: 0,
        circulatingSupply: 0,
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
        marketCap: 0,
        volume24h: 0,
        price24hChange: 0,
        holders: 0,
        totalSupply: 0,
        circulatingSupply: 0,
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
        marketCap: 0,
        volume24h: 0,
        price24hChange: 0,
        holders: 0,
        totalSupply: 0,
        circulatingSupply: 0,
    }
};