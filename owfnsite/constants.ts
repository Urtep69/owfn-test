

import type { TokenAllocation, RoadmapPhase, Language, SocialCase, VestingSchedule, PresaleTransaction, TokenDetails, LiveTransaction, Article, Poll } from './types.ts';
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
        id: 'hospital-wing-romania',
        title: { en: 'Modernize a Children\'s Hospital Wing in Romania', ro: 'Modernizarea unei aripi de spital pentru copii în România' },
        description: { en: 'Provide state-of-the-art medical equipment and renovate facilities for pediatric care.', ro: 'Furnizarea de echipamente medicale de ultimă generație și renovarea facilităților pentru îngrijirea pediatrică.' },
        category: 'Health',
        imageUrl: 'https://images.unsplash.com/photo-1586765522523-6e3e00a2131c?q=80&w=1920&auto=format&fit=crop',
        goal: 75000,
        donated: 42500,
        details: { en: 'Detailed breakdown of costs, timeline, and expected outcomes for the hospital modernization project.', ro: 'Detalii despre costuri, cronologie și rezultatele așteptate pentru proiectul de modernizare a spitalului.' },
        status: 'ongoing',
    },
    {
        id: 'school-supplies-kenya',
        title: { en: 'School Supplies for 500 Children in Kenya', ro: 'Rechizite școlare pentru 500 de copii din Kenya' },
        description: { en: 'Equip students in rural Kenya with notebooks, pens, and textbooks for a full school year.', ro: 'Echiparea elevilor din zonele rurale din Kenya cu caiete, pixuri și manuale pentru un an școlar complet.' },
        category: 'Education',
        imageUrl: 'https://images.unsplash.com/photo-1495721835496-4465d8c6b71b?q=80&w=1920&auto=format&fit=crop',
        goal: 15000,
        donated: 15000,
        details: { en: 'Full transparency on the procurement and distribution of school supplies.', ro: 'Transparență totală privind achiziția și distribuția rechizitelor școlare.' },
        status: 'completed',
    },
     {
        id: 'elderly-home-moldova',
        title: { en: 'Construct a Dignified Home for the Elderly in Moldova', ro: 'Construirea unui azil de bătrâni demn în Moldova' },
        description: { en: 'Build a new, safe, and comfortable facility to house 50 elderly individuals in need.', ro: 'Construirea unei noi facilități sigure și confortabile pentru a găzdui 50 de persoane vârstnice aflate în nevoie.' },
        category: 'Basic Needs',
        imageUrl: 'https://images.unsplash.com/photo-1617450365313-2467d34a46a2?q=80&w=1920&auto=format&fit=crop',
        goal: 250000,
        donated: 112750,
        details: { en: 'Architectural plans, budget, and construction schedule for the elderly home project.', ro: 'Planuri arhitecturale, buget și program de construcție pentru proiectul azilului de bătrâni.' },
        status: 'ongoing',
    },
    {
        id: 'clean-water-vietnam',
        title: { en: 'Clean Water Well for a Village in Vietnam', ro: 'Fântână de apă curată pentru un sat din Vietnam' },
        description: { en: 'Fund the construction of a deep water well to provide clean and safe drinking water for over 1000 people.', ro: 'Finanțarea construcției unei fântâni de mare adâncime pentru a furniza apă potabilă curată și sigură pentru peste 1000 de persoane.' },
        category: 'Basic Needs',
        imageUrl: 'https://images.unsplash.com/photo-1596700247971-b0583a87a2a0?q=80&w=1920&auto=format&fit=crop',
        goal: 25000,
        donated: 0,
        details: { en: 'Geological survey results, drilling costs, and community impact assessment.', ro: 'Rezultatele studiului geologic, costurile de foraj și evaluarea impactului comunitar.' },
        status: 'future',
    },
    {
        id: 'digital-literacy-brazil',
        title: { en: 'Digital Literacy Program for Favela Youth in Brazil', ro: 'Program de alfabetizare digitală pentru tinerii din favele în Brazilia' },
        description: { en: 'Establish a computer lab and provide training to empower young people with essential digital skills.', ro: 'Înființarea unui laborator de informatică și furnizarea de instruire pentru a oferi tinerilor competențe digitale esențiale.' },
        category: 'Education',
        imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1920&auto=format&fit=crop',
        goal: 40000,
        donated: 41500,
        details: { en: 'Details on hardware, curriculum, and long-term sustainability plan.', ro: 'Detalii despre hardware, curriculum și planul de sustenabilitate pe termen lung.' },
        status: 'completed',
    },
];

export const MOCK_ARTICLES: Article[] = [
    {
        id: 'owfn-launch-announcement',
        title: { en: 'A New Dawn: Official World Family Network Begins Its Journey', ro: 'O Nouă Zori: Official World Family Network Își Începe Călătoria' },
        summary: { en: 'Today marks the beginning of a new era in transparent, community-driven philanthropy. The OWFN project is officially live, and our presale is open to all visionaries who believe in a better world.', ro: 'Astăzi marchează începutul unei noi ere în filantropia transparentă, condusă de comunitate. Proiectul OWFN este oficial live, iar prevânzarea noastră este deschisă tuturor vizionarilor care cred într-o lume mai bună.' },
        content: { en: 'The journey of a thousand miles begins with a single step. For the Official World Family Network, that step is taken today. We are immensely proud to launch a platform built on the principles of transparency, efficiency, and profound human impact. Our mission is clear: to leverage the power of Solana to create a decentralized aid system that directly connects those who want to help with those who need it most. The presale is not just an investment opportunity; it\'s an invitation to become a founding member of a global family dedicated to creating lasting change. Join us as we build a legacy of hope, one project at a time.', ro: 'Călătoria de o mie de mile începe cu un singur pas. Pentru Official World Family Network, acest pas este făcut astăzi. Suntem extrem de mândri să lansăm o platformă construită pe principiile transparenței, eficienței și impactului uman profund. Misiunea noastră este clară: să valorificăm puterea Solanei pentru a crea un sistem de ajutor descentralizat care conectează direct pe cei care vor să ajute cu cei care au cea mai mare nevoie. Prevânzarea nu este doar o oportunitate de investiție; este o invitație de a deveni un membru fondator al unei familii globale dedicate creării unei schimbări durabile. Alăturați-vă nouă în timp ce construim o moștenire de speranță, un proiect pe rând.' },
        imageUrl: 'https://images.unsplash.com/photo-1583521226233-ff0278782a25?q=80&w=1920&auto=format&fit=crop',
        category: 'OWFN Updates',
        date: '2025-08-13T12:00:00Z',
        author: 'The OWFN Team',
    },
    {
        id: 'solana-token2022-deep-dive',
        title: { en: 'Why Solana\'s Token-2022 Standard is a Game-Changer for Impact Projects', ro: 'De ce standardul Token-2022 al Solanei schimbă jocul pentru proiectele de impact' },
        summary: { en: 'Discover the advanced features of the Token-2022 standard, like interest-bearing mechanisms and transfer fees, and how OWFN is leveraging them to create a self-sustaining philanthropic ecosystem.', ro: 'Descoperiți funcționalitățile avansate ale standardului Token-2022, cum ar fi mecanismele purtătoare de dobândă și taxele de transfer, și cum OWFN le valorifică pentru a crea un ecosistem filantropic auto-susținut.' },
        content: { en: 'The evolution of blockchain technology constantly opens new doors for innovation. The Token-2022 standard on Solana is a prime example, offering a suite of powerful extensions that go far beyond a simple token transfer. For OWFN, two features are particularly transformative. First, the Interest-Bearing extension allows us to reward our holders with a 2% APY automatically, encouraging long-term participation. Second, the Transfer Fee extension is the engine of our sustainability. By activating a small 0.5% fee after the presale, every future transaction perpetually fuels our Impact Treasury. This creates a powerful, self-sustaining cycle where the very act of using the token contributes to our global mission. It\'s a revolutionary model for transparent, continuous social good.', ro: 'Evoluția tehnologiei blockchain deschide constant noi uși pentru inovație. Standardul Token-2022 de pe Solana este un prim exemplu, oferind o suită de extensii puternice care depășesc cu mult un simplu transfer de tokenuri. Pentru OWFN, două caracteristici sunt deosebit de transformatoare. În primul rând, extensia purtătoare de dobândă ne permite să ne recompensăm automat deținătorii cu un APY de 2%, încurajând participarea pe termen lung. În al doilea rând, extensia taxei de transfer este motorul sustenabilității noastre. Prin activarea unei mici taxe de 0,5% după prevânzare, fiecare tranzacție viitoare alimentează perpetuu Trezoreria noastră de Impact. Acest lucru creează un ciclu puternic, auto-susținut, în care simplul act de a folosi tokenul contribuie la misiunea noastră globală. Este un model revoluționar pentru un bine social transparent și continuu.' },
        imageUrl: 'https://images.unsplash.com/photo-1642104793527-021a0857a8a1?q=80&w=1920&auto=format&fit=crop',
        category: 'Crypto News',
        date: '2025-07-25T10:00:00Z',
        author: 'Crypto Analyst',
    },
    {
        id: 'first-impact-story',
        title: { en: 'From Vision to Reality: Our First Completed Project', ro: 'De la Viziune la Realitate: Primul Nostru Proiect Finalizat' },
        summary: { en: 'Thanks to the incredible support of our early community, we are thrilled to announce the successful completion of the "School Supplies for 500 Children in Kenya" initiative. See the impact you made possible.', ro: 'Datorită sprijinului incredibil al comunității noastre timpurii, suntem încântați să anunțăm finalizarea cu succes a inițiativei "Rechizite școlare pentru 500 de copii din Kenya". Vedeți impactul pe care l-ați făcut posibil.' },
        content: { en: 'It is with immense joy that we share this update. The funds raised have been fully deployed, and 500 students in rural Kenya now have the notebooks, pens, and textbooks they need to pursue their education for the entire school year. The distribution process was documented and can be verified through the transaction hashes linked on the project\'s page in our Impact Portal. This is more than just a donation; it\'s a testament to what we can achieve together. It is the first of many stories we will write as a global family. Your trust and support have turned a goal on a webpage into a tangible reality for these children, opening doors to a brighter future.', ro: 'Cu o bucurie imensă împărtășim această actualizare. Fondurile strânse au fost complet utilizate, iar 500 de elevi din zonele rurale din Kenya au acum caietele, pixurile și manualele de care au nevoie pentru a-și continua educația pe parcursul întregului an școlar. Procesul de distribuție a fost documentat și poate fi verificat prin hash-urile tranzacțiilor de pe pagina proiectului din Portalul nostru de Impact. Aceasta este mai mult decât o simplă donație; este o mărturie a ceea ce putem realiza împreună. Este prima dintre multele povești pe care le vom scrie ca o familie globală. Încrederea și sprijinul dumneavoastră au transformat un obiectiv de pe o pagină web într-o realitate tangibilă pentru acești copii, deschizând uși către un viitor mai luminos.' },
        imageUrl: 'https://images.unsplash.com/photo-1594312693444-fc60443d5c64?q=80&w=1920&auto=format&fit=crop',
        category: 'Impact Stories',
        date: '2026-03-10T15:00:00Z',
        author: 'The OWFN Team',
    }
];

export const MOCK_POLLS: Poll[] = [
    {
        id: 'poll-1',
        question: { en: 'Which impact area should our next major fundraising campaign focus on?', ro: 'Pe ce domeniu de impact ar trebui să se concentreze următoarea noastră campanie majoră de strângere de fonduri?' },
        options: [
            { id: 'opt-1-1', text: { en: 'Healthcare Modernization', ro: 'Modernizarea Sănătății' } },
            { id: 'opt-1-2', text: { en: 'Educational Infrastructure', ro: 'Infrastructură Educațională' } },
            { id: 'opt-1-3', text: { en: 'Emergency Disaster Relief', ro: 'Ajutor de Urgență în Caz de Dezastru' } },
        ],
        endDate: new Date('2026-05-31T23:59:59Z'),
    },
    {
        id: 'poll-2',
        question: { en: 'What new feature would you most like to see on the OWFN platform?', ro: 'Ce funcționalitate nouă ați dori cel mai mult să vedeți pe platforma OWFN?' },
        options: [
            { id: 'opt-2-1', text: { en: 'Direct Governance (DAO) for Project Voting', ro: 'Guvernanță Directă (DAO) pentru Votarea Proiectelor' } },
            { id: 'opt-2-2', text: { en: 'Impact NFT Marketplace', ro: 'Piață de NFT-uri de Impact' } },
            { id: 'opt-2-3', text: { en: 'Gamified Donor Leaderboards', ro: 'Clasamente Gamificate ale Donatorilor' } },
        ],
        endDate: new Date('2026-04-30T23:59:59Z'),
    }
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