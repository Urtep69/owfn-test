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
    title: { en: 'Hospital Modernization in Rural Africa', ro: 'Modernizarea Spitalului în Africa Rurală' },
    description: { en: 'Providing modern medical equipment and renovating facilities for a community hospital.', ro: 'Furnizarea de echipamente medicale moderne și renovarea facilităților pentru un spital comunitar.' },
    details: { en: 'This project aims to equip the main operating theater with new surgical tools, replace outdated diagnostic equipment, and improve the sanitation systems to provide better healthcare for over 50,000 people in the region.', ro: 'Acest proiect urmărește dotarea sălii principale de operație cu instrumentar chirurgical nou, înlocuirea echipamentelor de diagnosticare învechite și îmbunătățirea sistemelor de salubritate pentru a oferi asistență medicală mai bună pentru peste 50.000 de persoane din regiune.' },
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&auto=format&fit=crop',
    goal: 75000,
    donated: 32000,
    lat: 5.6037, // Accra, Ghana
    lng: -0.1870,
    status: 'urgent-active',
  },
  {
    id: 'case-2',
    title: { en: 'Build a School in Southeast Asia', ro: 'Construirea unei Școli în Asia de Sud-Est' },
    description: { en: 'Constructing a new primary school building to provide education for 200 children.', ro: 'Construirea unei noi clădiri de școală primară pentru a oferi educație pentru 200 de copii.' },
    details: { en: 'The current school is a temporary structure that is unsafe during the rainy season. This project will build a permanent, earthquake-resistant building with 5 classrooms, a library, and proper sanitation facilities, giving children a safe space to learn and grow.', ro: 'Școala actuală este o structură temporară, nesigură în timpul sezonului ploios. Acest proiect va construi o clădire permanentă, rezistentă la cutremure, cu 5 săli de clasă, o bibliotecă și facilități sanitare adecvate, oferind copiilor un spațiu sigur pentru a învăța și a se dezvolta.' },
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop',
    goal: 50000,
    donated: 45000,
    lat: 13.7563, // Bangkok, Thailand
    lng: 100.5018,
    status: 'active',
  },
  {
    id: 'case-3',
    title: { en: 'Clean Water Initiative in South America', ro: 'Inițiativă pentru Apă Curată în America de Sud' },
    description: { en: 'Installation of water purification systems for a remote village.', ro: 'Instalarea de sisteme de purificare a apei pentru un sat izolat.' },
    details: { en: 'This village currently relies on a contaminated river for their water supply, leading to widespread illness. We will install three high-capacity water filters and train local community members on their maintenance, providing a sustainable source of clean drinking water.', ro: 'Acest sat se bazează în prezent pe un râu contaminat pentru aprovizionarea cu apă, ceea ce duce la îmbolnăviri pe scară largă. Vom instala trei filtre de apă de mare capacitate și vom instrui membrii comunității locale cu privire la întreținerea acestora, oferind o sursă durabilă de apă potabilă curată.' },
    category: 'Basic Needs',
    imageUrl: 'https://images.unsplash.com/photo-1599395123999-98096a77a6f2?q=80&w=800&auto=format&fit=crop',
    goal: 25000,
    donated: 25000,
    lat: -12.0464, // Lima, Peru
    lng: -77.0428,
    status: 'completed',
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