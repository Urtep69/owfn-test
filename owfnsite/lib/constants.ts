import type { Language, PresaleStage, SocialCase, TokenDetails } from './types.js';

export const QUICKNODE_RPC_URL = process.env.NEXT_PUBLIC_QUICKNODE_RPC_URL || "https://api.mainnet-beta.solana.com";
export const QUICKNODE_WSS_URL = process.env.NEXT_PUBLIC_QUICKNODE_WSS_URL || "wss://api.mainnet-beta.solana.com";
export const ADMIN_WALLET_ADDRESS = 'AdminWalletAddressHerePleaseReplace111111111111'; // Replace with a real admin wallet address

export const OWFN_LOGO_URL = '/assets/owfn.png';
export const OWFN_MINT_ADDRESS = 'owfn7b4q2s6T1P6d5f9w3c1a8k2L5m4N9j7g8H6p'; // Fictional mint address

export const MAINTENANCE_MODE_ACTIVE = false;

export const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
];

export const PRESALE_STAGES: PresaleStage[] = [
    {
        phase: 1,
        titleKey: 'presale_phase_1_title',
        status: 'active',
        startDate: '2025-09-20T00:00:00Z',
        endDate: '2025-10-21T00:00:00Z',
        rate: 9000000,
        softCap: 105,
        hardCap: 200,
        minBuy: 0.0001,
        maxBuy: 10,
        distributionWallet: 'PresaleWalletAddressHerePleaseReplace11111111', // Replace
        bonusTiers: [
            { threshold: 1, percentage: 5, nameKey: 'bonus_tier_copper' },
            { threshold: 2.5, percentage: 8, nameKey: 'bonus_tier_bronze' },
            { threshold: 5, percentage: 12, nameKey: 'bonus_tier_silver' },
            { threshold: 10, percentage: 20, nameKey: 'bonus_tier_gold' },
        ],
    },
];

export const TOKEN_DETAILS = {
    totalSupply: 18_000_000_000,
    decimals: 9,
    standard: 'SPL Token (Token-2022)',
    extensions: 'Interest-Bearing, Transfer Fee',
    presalePrice: '1 SOL = 9,000,000 OWFN',
    dexLaunchPrice: '1 SOL ≈ 6,670,000 OWFN',
};

export const TOKEN_ALLOCATIONS = [
    { name: 'Impact Treasury', value: 6_300_000_000, percentage: 35, color: '#10B981' },
    { name: 'Community & Ecosystem', value: 5_400_000_000, percentage: 30, color: '#3B82F6' },
    { name: 'Presale & Liquidity', value: 2_880_000_000, percentage: 16, color: '#F59E0B' },
    { name: 'Team', value: 2_700_000_000, percentage: 15, color: '#8B5CF6' },
    { name: 'Marketing', value: 540_000_000, percentage: 3, color: '#EC4899' },
    { name: 'Advisors', value: 180_000_000, percentage: 1, color: '#6366F1' },
];

export const DISTRIBUTION_WALLETS = {
    presale: 'PresaleWalletAddressHerePleaseReplace11111111',
    impactTreasury: 'ImpactWalletAddressHerePleaseReplace11111111',
    community: 'CommunityWalletAddressHerePleaseReplace111111',
    team: 'TeamWalletAddressHerePleaseReplace11111111111',
    marketing: 'MarketingWalletAddressHerePleaseReplace111111',
    advisors: 'AdvisorsWalletAddressHerePleaseReplace111111',
};

export const KNOWN_TOKEN_MINT_ADDRESSES: Record<string, string> = {
    'OWFN': OWFN_MINT_ADDRESS,
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};

export const PROJECT_LINKS = {
    website: 'https://www.owfn.org/',
    x: 'https://x.com/OWFN_Official',
    telegramGroup: 'https://t.me/OWFNOfficial',
    telegramChannel: 'https://t.me/OWFN_Announcements', // Example
    discord: 'https://discord.gg/DzHm5HCqDW',
};

export const ROADMAP_DATA = [
    { quarter: 'Q3 2025', key_prefix: 'phase_1' },
    { quarter: 'Q4 2025', key_prefix: 'phase_2' },
    { quarter: 'Q1 2026', key_prefix: 'phase_3' },
    { quarter: 'Q2 2026', key_prefix: 'phase_4' },
];

export const INITIAL_SOCIAL_CASES: SocialCase[] = [
    {
        id: '1',
        title: { en: 'Clean Water for the Village of Aso', 'es': 'Agua Limpia para el Pueblo de Aso' },
        description: { en: 'Help us build a new well to provide clean, safe drinking water to over 500 residents.', 'es': 'Ayúdanos a construir un nuevo pozo para proporcionar agua potable y segura a más de 500 residentes.' },
        details: { en: 'This project involves drilling a new borehole, installing a solar-powered pump, and building a water storage tank. This will reduce waterborne diseases and save villagers hours each day from fetching water from distant sources.', 'es': 'Este proyecto implica perforar un nuevo pozo, instalar una bomba de energía solar y construir un tanque de almacenamiento de agua. Esto reducirá las enfermedades transmitidas por el agua y ahorrará a los aldeanos horas cada día de ir a buscar agua a fuentes lejanas.' },
        category: 'Basic Needs',
        imageUrl: 'https://picsum.photos/seed/water/400/300',
        goal: 15000,
        donated: 8500,
    },
    {
        id: '2',
        title: { en: 'School Supplies for Children in Sierra Leone', 'es': 'Útiles Escolares para Niños en Sierra Leona' },
        description: { en: 'Provide notebooks, pens, and textbooks for 200 elementary school students for an entire year.', 'es': 'Proporcionar cuadernos, bolígrafos y libros de texto para 200 estudiantes de primaria durante todo un año.' },
        details: { en: 'Many children in rural Sierra Leone lack basic school supplies, which is a major barrier to their education. This project partners with local schools to distribute these essential materials directly to the students who need them most.', 'es': 'Muchos niños en las zonas rurales de Sierra Leona carecen de útiles escolares básicos, lo cual es una barrera importante para su educación. Este proyecto se asocia con escuelas locales para distribuir estos materiales esenciales directamente a los estudiantes que más los necesitan.' },
        category: 'Education',
        imageUrl: 'https://picsum.photos/seed/school/400/300',
        goal: 5000,
        donated: 1200,
    },
     {
        id: '3',
        title: { en: 'Medical Clinic Support in Rural Guatemala', 'es': 'Apoyo a Clínica Médica en la Guatemala Rural' },
        description: { en: 'Fund essential medical supplies and equipment for a rural clinic serving a remote indigenous community.', 'es': 'Financiar suministros y equipos médicos esenciales para una clínica rural que atiende a una comunidad indígena remota.' },
        details: { en: 'This clinic is the only source of healthcare for thousands of people. This project will provide them with antibiotics, vaccines, sterile equipment, and a new ultrasound machine to improve maternal and child health outcomes.', 'es': 'Esta clínica es la única fuente de atención médica para miles de personas. Este proyecto les proporcionará antibióticos, vacunas, equipo estéril y una nueva máquina de ultrasonido para mejorar los resultados de salud materno-infantil.' },
        category: 'Health',
        imageUrl: 'https://picsum.photos/seed/health/400/300',
        goal: 25000,
        donated: 19800,
    },
];

export const MOCK_TOKEN_DETAILS: Record<string, Partial<TokenDetails>> = {
    'OWFN': {
        mintAddress: OWFN_MINT_ADDRESS,
        description: 'The Official World Family Network (OWFN) token is a utility token that powers a decentralized ecosystem for transparent humanitarian aid. It is used for governance, donations, and staking within the OWFN platform.',
    },
    'USDC': {
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        description: 'USDC is a stablecoin redeemable on a 1:1 basis for US dollars, backed by dollar-denominated assets held in segregated accounts with US regulated financial institutions.',
    },
    'USDT': {
        mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        description: 'Tether (USDT) is a stablecoin pegged to the US dollar. It is designed to bridge the gap between fiat currencies and cryptocurrencies and offer stability, transparency, and minimal transaction charges to users.',
    }
};