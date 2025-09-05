import type { Language, SocialCase, TokenDetails } from './types.ts';
import { Color } from 'csstype';

export const OWFN_LOGO_URL = '/assets/owfn.png';

export const MAINTENANCE_MODE_ACTIVE = false;

// A real admin wallet address would be kept secret, but this is for demo purposes.
export const ADMIN_WALLET_ADDRESS = 'AdminWalletAddress_ReplaceWithRealOneForTesting';

// Using a public RPC for demo purposes. In production, a dedicated one is essential.
export const QUICKNODE_RPC_URL = 'https://api.mainnet-beta.solana.com';
export const QUICKNODE_WSS_URL = 'wss://api.mainnet-beta.solana.com';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export const OWFN_MINT_ADDRESS = 'Ckv4czD6n7m25h3ZZ2iGqLC23Q3p2259a45x7B5q1J6p';

export const KNOWN_TOKEN_MINT_ADDRESSES: { [key: string]: string } = {
  'SOL': 'So11111111111111111111111111111111111111112',
  'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
  'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  'OWFN': OWFN_MINT_ADDRESS,
};

export const TOKEN_DETAILS = {
  totalSupply: 18_000_000_000,
  decimals: 9,
  standard: 'SPL Token-2022',
  extensions: 'Interest-Bearing (2% APY), Transfer Fee (0.5%)',
  presalePrice: '1 SOL = 10,000,000 OWFN',
  dexLaunchPrice: '1 SOL = 8,000,000 OWFN'
};

export const TOKEN_ALLOCATIONS: { name: string; value: number; percentage: number; color: Color }[] = [
  { name: 'Impact Treasury & Social Initiatives', value: 6_300_000_000, percentage: 35, color: '#4CAF50' },
  { name: 'Community & Ecosystem Fund', value: 5_400_000_000, percentage: 30, color: '#2196F3' },
  { name: 'Presale & Initial Liquidity', value: 2_880_000_000, percentage: 16, color: '#FFC107' },
  { name: 'Team & Founders', value: 2_700_000_000, percentage: 15, color: '#9C27B0' },
  { name: 'Marketing & Business Development', value: 540_000_000, percentage: 3, color: '#F44336' },
  { name: 'Advisors & Partnerships', value: 180_000_000, percentage: 1, color: '#795548' },
];

export const PRESALE_DETAILS = {
  startDate: new Date('2025-08-13T12:00:00Z'),
  endDate: new Date('2025-09-12T12:00:00Z'),
  rate: 10_000_000,
  softCap: 50,
  hardCap: 250,
  minBuy: 0.1,
  maxBuy: 5,
  bonusThreshold: 2, // SOL
  bonusPercentage: 10,
};

export const DISTRIBUTION_WALLETS = {
  presale: 'PresaleWalletAddress_ReplaceWithRealOneForTesting',
  impactTreasury: 'ImpactWalletAddress_ReplaceWithRealOneForTesting',
  community: 'CommunityWalletAddress_ReplaceWithRealOneForTesting',
  team: 'TeamWalletAddress_ReplaceWithRealOneForTesting',
  marketing: 'MarketingWalletAddress_ReplaceWithRealOneForTesting',
  advisors: 'AdvisorsWalletAddress_ReplaceWithRealOneForTesting',
};

export const PROJECT_LINKS = {
    website: 'https://www.owfn.org/',
    x: 'https://x.com/OWFN_Official',
    telegramGroup: 'https://t.me/OWFNOfficial',
    telegramChannel: 'https://t.me/OWFN_Official_Channel', // Example
    discord: 'https://discord.gg/DzHm5HCqDW',
};

export const INITIAL_SOCIAL_CASES: SocialCase[] = [
    {
        id: 'case1',
        title: { en: 'Build a School in Rural Ghana', ro: 'Construiește o școală în Ghana rurală', es: 'Construir una escuela en la Ghana rural' },
        description: { en: 'Provide quality education to over 200 children by constructing a new school building with modern facilities.', ro: 'Oferă educație de calitate pentru peste 200 de copii prin construirea unei noi clădiri școlare cu facilități moderne.', es: 'Proporcionar educación de calidad a más de 200 niños mediante la construcción de un nuevo edificio escolar con instalaciones modernas.' },
        details: { en: 'This project includes 4 classrooms, a library, and sanitation facilities. It will empower the next generation through education.', ro: 'Acest proiect include 4 săli de clasă, o bibliotecă și facilități sanitare. Va împuternici următoarea generație prin educație.', es: 'Este proyecto incluye 4 aulas, una biblioteca e instalaciones sanitarias. Empoderará a la próxima generación a través de la educación.' },
        imageUrl: 'https://images.unsplash.com/photo-1594312919269-80521c7f8a8b?q=80&w=2070&auto=format&fit=crop',
        goalUSD: 50000,
        fundedUSD: 12500,
        category: 'education',
        location: { country: 'Ghana', city: 'Kumasi', lat: 6.6885, lng: -1.6244 }
    },
    {
        id: 'case2',
        title: { en: 'Medical Supplies for a Clinic in Peru', ro: 'Furnituri medicale pentru o clinică din Peru', es: 'Suministros médicos para una clínica en Perú' },
        description: { en: 'Equip a remote clinic in the Andes with essential medical supplies to serve a community of 500 people.', ro: 'Echipează o clinică izolată din Anzi cu furnituri medicale esențiale pentru a deservi o comunitate de 500 de persoane.', es: 'Equipar una clínica remota en los Andes con suministros médicos esenciales para atender a una comunidad de 500 personas.' },
        details: { en: 'Funds will be used to purchase antibiotics, vaccines, first-aid kits, and basic diagnostic equipment. This will drastically improve healthcare access in the region.', ro: 'Fondurile vor fi folosite pentru a achiziționa antibiotice, vaccinuri, truse de prim ajutor și echipamente de diagnostic de bază. Acest lucru va îmbunătăți drastic accesul la asistență medicală în regiune.', es: 'Los fondos se utilizarán para comprar antibióticos, vacunas, botiquines de primeros auxilios y equipo de diagnóstico básico. Esto mejorará drásticamente el acceso a la atención médica en la región.' },
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop',
        goalUSD: 15000,
        fundedUSD: 7500,
        category: 'health',
        location: { country: 'Peru', city: 'Cusco', lat: -13.5319, lng: -71.9675 }
    },
    {
        id: 'case3',
        title: { en: 'Clean Water Well for a Village in Kenya', ro: 'Fântână de apă curată pentru un sat din Kenya', es: 'Pozo de agua potable para una aldea en Kenia' },
        description: { en: 'Construct a borehole well to provide a reliable source of clean and safe drinking water for a village of 800 residents.', ro: 'Construiește o fântână forată pentru a oferi o sursă fiabilă de apă potabilă curată și sigură pentru un sat de 800 de locuitori.', es: 'Construir un pozo de sondeo para proporcionar una fuente fiable de agua potable limpia y segura para una aldea de 800 residentes.' },
        details: { en: 'The project will eliminate the need for long daily treks to fetch contaminated water, reducing waterborne diseases and freeing up time for education and economic activities.', ro: 'Proiectul va elimina necesitatea unor lungi călătorii zilnice pentru a aduce apă contaminată, reducând bolile transmise prin apă și eliberând timp pentru educație și activități economice.', es: 'El proyecto eliminará la necesidad de largos trayectos diarios para buscar agua contaminada, reduciendo las enfermedades transmitidas por el agua y liberando tiempo para la educación y las actividades económicas.' },
        imageUrl: 'https://images.unsplash.com/photo-1597793013233-36f234384354?q=80&w=1974&auto=format&fit=crop',
        goalUSD: 25000,
        fundedUSD: 21000,
        category: 'basic-needs',
        location: { country: 'Kenya', city: 'Nairobi', lat: -1.2921, lng: 36.8219 }
    }
];

export const ROADMAP_DATA = [
  { quarter: 'Q3 2025', key_prefix: 'roadmap_q3_2025' },
  { quarter: 'Q4 2025', key_prefix: 'roadmap_q4_2025' },
  { quarter: 'Q1 2026', key_prefix: 'roadmap_q1_2026' },
  { quarter: 'Q2 2026', key_prefix: 'roadmap_q2_2026' },
];

export const MOCK_TOKEN_DETAILS: { [key: string]: Partial<TokenDetails> } = {
  'OWFN': {
    mintAddress: OWFN_MINT_ADDRESS,
    description: "The Official World Family Network (OWFN) token is the native utility token of the ecosystem, designed to facilitate transparent humanitarian aid and community governance. As an interest-bearing token on the SPL Token-2022 standard, it automatically provides a 2% APY to its holders, rewarding long-term support for the project's mission. A 0.5% transfer fee, activated post-presale, ensures sustainable funding for the Impact Treasury, turning every transaction into a micro-donation for global causes.",
  }
};
