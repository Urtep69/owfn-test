import type { TokenAllocation, RoadmapPhase, Language, SocialCase, VestingSchedule, PresaleTransaction, TokenDetails, LiveTransaction, PresaleStage } from './types.ts';

export const OWFN_MINT_ADDRESS = 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B';
export const OWFN_LOGO_URL: string = '/assets/owfn.png';
export const ADMIN_WALLET_ADDRESS = '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy'; // Admin wallet
export const MAINTENANCE_MODE_ACTIVE = false; // Set to true to enable maintenance mode globally

export const QUICKNODE_RPC_URL = 'https://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/';
export const QUICKNODE_WSS_URL = 'wss://evocative-falling-frost.solana-mainnet.quiknode.pro/ba8af81f043571b8761a7155b2b40d4487ab1c4c/';


export const TOKEN_DETAILS = {
  totalSupply: 18_000_000_000,
  decimals: 9,
  standard: 'SPL Token 2022',
  extensions: 'Transfer Fee (0.5% activated after presale concludes), Interest-Bearing (2% APR)',
  presalePrice: '1 SOL = 9,000,000 OWFN', // Updated to match the new rate
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

export const PRESALE_STAGES: PresaleStage[] = [
    {
        phase: 1,
        titleKey: 'public_presale',
        status: 'active',
        startDate: '2025-09-20T00:00:00Z',
        endDate: '2025-10-21T00:00:00Z',
        rate: 9000000,
        bonusTiers: [
            { threshold: 1, percentage: 5, nameKey: 'bonus_tier_copper', icon: '🟫' },
            { threshold: 2.5, percentage: 8, nameKey: 'bonus_tier_bronze', icon: '🥉' },
            { threshold: 5, percentage: 12, nameKey: 'bonus_tier_silver', icon: '🥈' },
            { threshold: 10, percentage: 20, nameKey: 'bonus_tier_gold', icon: '🥇' },
        ],
        minBuy: 0.0001,
        maxBuy: 10,
        softCap: 105,
        hardCap: 200,
        distributionWallet: DISTRIBUTION_WALLETS.presale,
    }
];


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
        logo: '/assets/owfn.png',
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 9,
        description: 'OWFN (Official World Family Network) is a Solana-based token designed to unite families globally through blockchain technology, focusing on social impact, education, health, and humanitarian aid with full transparency.',
        marketCap: 0,
        volume24h: 0,
        // FIX: Removed 'price24hChange' as it does not exist in the TokenDetails type.
        holders: 0,
        totalSupply: 18_000_000_000,
        circulatingSupply: 0,
    },
    'SOL': {
        name: 'Solana',
        symbol: 'SOL',
        mintAddress: 'So11111111111111111111111111111111111111112',
        logo: '/assets/solana.png',
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 9,
        description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.',
        marketCap: 0,
        volume24h: 0,
        // FIX: Removed 'price24hChange' as it does not exist in the TokenDetails type.
        holders: 0,
        totalSupply: 0,
        circulatingSupply: 0,
    },
     'USDC': {
        name: 'USD Coin',
        symbol: 'USDC',
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
        logo: '/assets/usdc.png',
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 6,
        description: 'USDC is a fully collateralized US dollar stablecoin. It is an Ethereum-powered coin and is the product of a collaboration between Circle and Coinbase.',
        marketCap: 0,
        volume24h: 0,
        // FIX: Removed 'price24hChange' as it does not exist in the TokenDetails type.
        holders: 0,
        totalSupply: 0,
        circulatingSupply: 0,
    },
     'USDT': {
        name: 'Tether',
        symbol: 'USDT',
        mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        logo: '/assets/usdt.png',
        balance: 0,
        usdValue: 0,
        pricePerToken: 0,
        decimals: 6,
        description: 'Tether (USDT) is a stablecoin pegged to the U.S. dollar. It is issued by the Hong Kong-based company Tether Limited.',
        marketCap: 0,
        volume24h: 0,
        // FIX: Removed 'price24hChange' as it does not exist in the TokenDetails type.
        holders: 0,
        totalSupply: 0,
        circulatingSupply: 0,
    }
};