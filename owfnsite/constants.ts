
import type { TokenAllocation, RoadmapPhase, Language, SocialCase, VestingSchedule, PresaleTransaction, TokenDetails, LiveTransaction } from './types.ts';
import React from 'react';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from './components/IconComponents.tsx';


export const OWFN_MINT_ADDRESS = 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B';
export const OWFN_LOGO_URL = 'https://www.owfn.org/owfn.png';
export const ADMIN_WALLET_ADDRESS = '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy'; // Admin wallet

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
  minBuy: 0.1,
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

export const INITIAL_SOCIAL_CASES: SocialCase[] = [
    {
        id: '1',
        title: {
            en: 'Build a School in Rural Ghana',
            de: 'Baue eine Schule im ländlichen Ghana',
            es: 'Construir una escuela en la Ghana rural',
            ja: 'ガーナの農村部に学校を建設',
            fr: 'Construire une école dans le Ghana rural',
            pt: 'Construir uma Escola na Zona Rural de Gana',
            ru: 'Построить школу в сельской местности Ганы',
            it: 'Costruire una scuola nel Ghana rurale',
            nl: 'Bouw een school in landelijk Ghana',
            ro: 'Construiește o Școală în Ghana Rurală',
            hu: 'Építs iskolát Ghána vidéki részén',
            sr: 'Изградимо школу у руралној Гани',
            tr: 'Kırsal Gana\'da bir okul inşa et',
            ko: '가나 농촌 지역에 학교 짓기',
            zh: '在加纳农村建一所学校',
        },
        description: {
            en: 'Help us construct a new primary school for 200 children in a remote village, providing them with a safe and modern learning environment.',
            de: 'Helfen Sie uns, eine neue Grundschule für 200 Kinder in einem abgelegenen Dorf zu bauen und ihnen eine sichere und moderne Lernumgebung zu bieten.',
            es: 'Ayúdanos a construir una nueva escuela primaria para 200 niños en una aldea remota, proporcionándoles un entorno de aprendizaje seguro y moderno.',
            ja: '遠隔地の村に200人の子供たちのための新しい小学校を建設し、安全で近代的な学習環境を提供するためのご支援をお願いします。',
            fr: 'Aidez-nous à construire une nouvelle école primaire pour 200 enfants dans un village reculé, leur offrant un environnement d\'apprentissage sûr et moderne.',
            pt: 'Ajude-nos a construir uma nova escola primária para 200 crianças em uma aldeia remota, proporcionando-lhes um ambiente de aprendizagem seguro e moderno.',
            ru: 'Помогите нам построить новую начальную школу для 200 детей в отдаленной деревне, обеспечив им безопасную и современную учебную среду.',
            it: 'Aiutaci a costruire una nuova scuola elementare per 200 bambini in un villaggio remoto, fornendo loro un ambiente di apprendimento sicuro e moderno.',
            nl: 'Help ons een nieuwe basisschool te bouwen voor 200 kinderen in een afgelegen dorp, en hen een veilige en moderne leeromgeving te bieden.',
            ro: 'Ajută-ne să construim o școală primară nouă pentru 200 de copii într-un sat izolat, oferindu-le un mediu de învățare sigur și modern.',
            hu: 'Segítsen nekünk egy új általános iskola építésében 200 gyermek számára egy távoli faluban, biztonságos és modern tanulási környezetet biztosítva számukra.',
            sr: 'Помозите нам да изградимо нову основну школу за 200 деце у удаљеном селу, пружајући им безбедно и модерно окружење за учење.',
            tr: 'Uzak bir köyde 200 çocuk için yeni bir ilkokul inşa etmemize yardımcı olun, onlara güvenli ve modern bir öğrenme ortamı sağlayın.',
            ko: '외딴 마을의 200명 어린이를 위한 새 초등학교를 짓는 데 도움을 주어 안전하고 현대적인 학습 환경을 제공해주세요.',
            zh: '帮助我们在一个偏远村庄为 200 名儿童建造一所新的小学，为他们提供一个安全和现代化的学习环境。',
        },
        category: 'Education',
        imageUrl: 'https://picsum.photos/seed/school/400/300',
        goal: 50000,
        donated: 12500,
        details: {
            en: 'Funding for construction materials, labor, and school supplies.',
            de: 'Finanzierung von Baumaterialien, Arbeitskräften und Schulmaterial.',
            es: 'Financiamiento para materiales de construcción, mano de obra y útiles escolares.',
            ja: '建設資材、人件費、学用品の資金。',
            fr: 'Financement des matériaux de construction, de la main-d\'œuvre et des fournitures scolaires.',
            pt: 'Financiamento para materiais de construção, mão de obra e material escolar.',
            ru: 'Финансирование строительных материалов, рабочей силы и школьных принадлежностей.',
            it: 'Fondi per materiali da costruzione, manodopera e materiale scolastico.',
            nl: 'Financiering voor bouwmaterialien, arbeid en schoolbenodigdheden.',
            ro: 'Finanțare pentru materiale de construcție, forță de muncă și rechizite școlare.',
            hu: 'Finanszírozás építőanyagokra, munkaerőre és iskolaszerekre.',
            sr: 'Финансирање грађевинског материјала, радне снаге и школског прибора.',
            tr: 'İnşaat malzemeleri, işçilik ve okul malzemeleri için finansman.',
            ko: '건축 자재, 인건비 및 학용품 자금 지원.',
            zh: '资助建筑材料、劳动力和学校用品。',
        }
    },
    {
        id: '2',
        title: {
            en: 'Medical Supplies for a Clinic in Syria',
            de: 'Medizinische Versorgung für eine Klinik in Syrien',
            es: 'Suministros médicos para una clínica en Siria',
            ja: 'シリアの診療所への医療品供給',
            fr: 'Fournitures médicales pour une clinique en Syrie',
            pt: 'Suprimentos Médicos para uma Clínica na Síria',
            ru: 'Медицинские принадлежности для клиники в Сирии',
            it: 'Forniture mediche per una clinica in Siria',
            nl: 'Medische benodigdheden voor een kliniek in Syrië',
            ro: 'Furnituri Medicale pentru o Clinică din Siria',
            hu: 'Orvosi felszerelések egy szíriai klinikára',
            sr: 'Медицински материјал за клинику у Сирији',
            tr: 'Suriye\'deki bir klinik için tıbbi malzemeler',
            ko: '시리아 진료소를 위한 의료 용품',
            zh: '为叙利亚诊所提供医疗用品',
        },
        description: {
            en: 'Provide essential medical supplies, including antibiotics, bandages, and surgical equipment, to a front-line clinic.',
            de: 'Stellen Sie einer Frontklinik lebenswichtige medizinische Versorgung zur Verfügung, einschließlich Antibiotika, Verbänden und chirurgischer Ausrüstung.',
            es: 'Proporcionar suministros médicos esenciales, incluidos antibióticos, vendajes y equipo quirúrgico, a una clínica de primera línea.',
            ja: '最前線の診療所に、抗生物質、包帯、手術器具などの必須医療品を提供します。',
            fr: 'Fournir des fournitures médicales essentielles, y compris des antibiotiques, des bandages et du matériel chirurgical, à une clinique de première ligne.',
            pt: 'Fornecer suprimentos médicos essenciais, incluindo antibióticos, bandagens e equipamentos cirúrgicos, para uma clínica de linha de frente.',
            ru: 'Обеспечить клинику на передовой необходимыми медикаментами, включая антибиотики, бинты и хирургическое оборудование.',
            it: 'Fornire forniture mediche essenziali, tra cui antibiotici, bende e attrezzature chirurgiche, a una clinica in prima linea.',
            nl: 'Lever essentiële medische benodigdheden, waaronder antibiotica, verband en chirurgische apparatuur, aan een eerstelijnskliniek.',
            ro: 'Furnizați consumabile medicale esențiale, inclusiv antibiotice, bandaje și echipamente chirurgice, unei clinici de primă linie.',
            hu: 'Biztosítson alapvető orvosi felszereléseket, beleértve az antibiotikumokat, kötszereket és sebészeti eszközöket egy frontvonalbeli klinikának.',
            sr: 'Обезбедите неопходан медицински материјал, укључујући антибиотике, завоје и хируршку опрему, клиници на првој линији фронта.',
            tr: 'Ön cephedeki bir kliniğe antibiyotikler, bandajlar ve cerrahi ekipmanlar dahil olmak üzere temel tıbbi malzemeler sağlayın.',
            ko: '최전선 진료소에 항생제, 붕대, 수술 장비를 포함한 필수 의료 용품을 제공해주세요.',
            zh: '为前线诊所提供必要的医疗用品，包括抗生素、绷带和手术设备。',
        },
        category: 'Health',
        imageUrl: 'https://picsum.photos/seed/clinic/400/300',
        goal: 20000,
        donated: 18000,
        details: {
            en: 'Urgent need for life-saving medical equipment.',
            de: 'Dringender Bedarf an lebensrettender medizinischer Ausrüstung.',
            es: 'Necesidad urgente de equipo médico que salve vidas.',
            ja: '救命医療機器の緊急の必要性。',
            fr: 'Besoin urgent d\'équipement médical vital.',
            pt: 'Necessidade urgente de equipamentos médicos que salvam vidas.',
            ru: 'Срочная потребность в жизнеспасающем медицинском оборудовании.',
            it: 'Necessità urgente di attrezzature mediche salvavita.',
            nl: 'Dringende behoefte aan levensreddende medische apparatuur.',
            ro: 'Nevoie urgentă de echipamente medicale salvatoare de vieți.',
            hu: 'Sürgős szükség van életmentő orvosi felszerelésekre.',
            sr: 'Хитна потреба за спасоносном медицинском опремом.',
            tr: 'Hayat kurtaran tıbbi ekipmanlara acil ihtiyaç var.',
            ko: '생명을 구하는 의료 장비에 대한 긴급한 필요.',
            zh: '急需救生医疗设备。',
        }
    },
    {
        id: '3',
        title: {
            en: 'Clean Water Well in Kenya',
            de: 'Brunnen für sauberes Wasser in Kenia',
            es: 'Pozo de agua limpia en Kenia',
            ja: 'ケニアのきれいな水の井戸',
            fr: 'Puits d\'eau potable au Kenya',
            pt: 'Poço de Água Limpa no Quênia',
            ru: 'Колодец с чистой водой в Кении',
            it: 'Pozzo di acqua pulita in Kenya',
            nl: 'Schoonwaterput in Kenia',
            ro: 'Fântână de Apă Curată în Kenya',
            hu: 'Tiszta vizű kút Kenyában',
            sr: 'Бунар чисте воде у Кенији',
            tr: 'Kenya\'da temiz su kuyusu',
            ko: '케냐의 깨끗한 물 우물',
            zh: '肯尼亚的清洁水井',
        },
        description: {
            en: 'Fund the construction of a deep water well to provide a sustainable source of clean drinking water for a community of 500 people.',
            de: 'Finanzieren Sie den Bau eines Tiefbrunnens, um eine nachhaltige Quelle für sauberes Trinkwasser für eine Gemeinschaft von 500 Menschen zu schaffen.',
            es: 'Financiar la construcción de un pozo de agua profundo para proporcionar una fuente sostenible de agua potable limpia para una comunidad de 500 personas.',
            ja: '500人のコミュニティに持続可能なきれいな飲料水の供給源を提供するための深井戸の建設資金。',
            fr: 'Financer la construction d\'un puits d\'eau profonde pour fournir une source durable d\'eau potable à une communauté de 500 personnes.',
            pt: 'Financiar a construção de um poço de água profundo para fornecer uma fonte sustentável de água potável para uma comunidade de 500 pessoas.',
            ru: 'Финансировать строительство глубокой скважины для обеспечения устойчивого источника чистой питьевой воды для общины из 500 человек.',
            it: 'Finanziare la costruzione di un pozzo profondo per fornire una fonte sostenibile di acqua potabile pulita a una comunità di 500 persone.',
            nl: 'Financier de aanleg van een diepe waterput om een duurzame bron van schoon drinkwater te bieden voor een gemeenschap van 500 mensen.',
            ro: 'Finanțează construcția unei fântâni de mare adâncime pentru a oferi o sursă durabilă de apă potabilă curată pentru o comunitate de 500 de persoane.',
            hu: 'Finanszírozza egy mélyvizes kút építését, hogy fenntartható tiszta ivóvízforrást biztosítson egy 500 fős közösség számára.',
            sr: 'Финансирајте изградњу дубоког бунара како би се обезбедио одржив извор чисте пијаће воде за заједницу од 500 људи.',
            tr: '500 kişilik bir topluluk için sürdürülebilir bir temiz içme suyu kaynağı sağlamak üzere derin bir su kuyusu inşaatını finanse edin.',
            ko: '500명 규모의 지역 사회를 위해 지속 가능한 깨끗한 식수원을 제공하기 위한 깊은 우물 건설 자금을 지원해주세요.',
            zh: '资助建造一口深水井，为一个 500 人的社区提供可持续的清洁饮用水源。',
        },
        category: 'Basic Needs',
        imageUrl: 'https://picsum.photos/seed/water/400/300',
        goal: 15000,
        donated: 5000,
        details: {
            en: 'Access to clean water will prevent disease and improve daily life.',
            de: 'Der Zugang zu sauberem Wasser wird Krankheiten vorbeugen und das tägliche Leben verbessern.',
            es: 'El acceso al agua limpia prevendrá enfermedades y mejorará la vida diaria.',
            ja: 'きれいな水へのアクセスは、病気を予防し、日常生活を改善します。',
            fr: 'L\'accès à l\'eau potable préviendra les maladies et améliorera la vie quotidienne.',
            pt: 'O acesso à água potável prevenirá doenças e melhorará a vida diária.',
            ru: 'Доступ к чистой воде предотвратит болезни и улучшит повседневную жизнь.',
            it: 'L\'accesso all\'acqua pulita preverrà le malattie e migliorerà la vita quotidiana.',
            nl: 'Toegang tot schoon water zal ziekten voorkomen en het dagelijks leven verbeteren.',
            ro: 'Accesul la apă curată va preveni bolile și va îmbunătăți viața de zi cu zi.',
            hu: 'A tiszta vízhez való hozzáférés megelőzi a betegségeket és javítja a mindennapi életet.',
            sr: 'Приступ чистој води ће спречити болести и побољшати свакодневни живот.',
            tr: 'Temiz suya erişim hastalıkları önleyecek ve günlük yaşamı iyileştirecektir.',
            ko: '깨끗한 물에 대한 접근은 질병을 예방하고 일상 생활을 개선할 것입니다.',
            zh: '获得清洁水将预防疾病并改善日常生活。',
        }
    },
];

export const KNOWN_TOKEN_MINT_ADDRESSES: { [key: string]: string } = {
  OWFN: 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B',
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
};

export const MOCK_PRESALE_TRANSACTIONS: PresaleTransaction[] = Array.from({ length: 20 }, (_, i) => ({
    id: Date.now() - i * 1000 * 60 * (Math.random() * 10 + 1),
    address: `User...${Math.random().toString(36).substring(2, 6)}`,
    solAmount: parseFloat((Math.random() * (PRESALE_DETAILS.maxBuy - PRESALE_DETAILS.minBuy) + PRESALE_DETAILS.minBuy).toFixed(2)),
    owfnAmount: 0, // This will be calculated based on solAmount
    time: new Date(Date.now() - i * 1000 * 60 * (Math.random() * 20 + 5)),
})).map(tx => ({...tx, owfnAmount: tx.solAmount * PRESALE_DETAILS.rate}));

export const MOCK_LIVE_TRANSACTIONS: LiveTransaction[] = Array.from({ length: 50 }, (_, i) => {
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = 0.00001234 + (Math.random() - 0.5) * 0.000001;
    const amount = Math.random() * 1000000;
    return {
        id: Date.now() - i * 1000 * (Math.random() * 5 + 1),
        time: new Date(Date.now() - i * 1000 * (Math.random() * 5 + 1)).toLocaleTimeString('en-US', { hour12: false }),
        type,
        price,
        amount,
        totalUsd: price * amount,
        maker: `xxxx...${Math.random().toString(36).substring(2, 6)}`,
    };
});

export const MOCK_TOKEN_DETAILS: { [symbol: string]: TokenDetails } = {
    'OWFN': {
        name: 'Official World Family Network',
        symbol: 'OWFN',
        mintAddress: OWFN_MINT_ADDRESS,
        logo: React.createElement(OwfnIcon),
        balance: 0,
        usdValue: 0.00001234,
        description: {
            en: 'OWFN (Official World Family Network) is a Solana-based token designed to unite families globally through blockchain technology, focusing on social impact, education, health, and humanitarian aid with full transparency.',
            // Add other languages as needed
        },
        security: { isMutable: false, mintAuthorityRevoked: true, freezeAuthorityRevoked: true },
        marketCap: 2221200,
        volume24h: 158370,
        price24hChange: 5.2,
        holders: 3500,
        circulatingSupply: 180000000000,
        liquidity: 500000,
        totalMarketCap: 2221200,
        volatility: 0.15,
        totalTx24h: 703,
        pooledSol: 3000,
        pooledToken: 1100000000,
        poolCreated: '2024-07-20',
        dextScore: { score: 99, maxScore: 99, points: [20, 25, 20, 20, 14] },
        audit: { contractVerified: true, isHoneypot: false, isFreezable: false, isMintable: false, alerts: 0 },
        communityTrust: { positiveVotes: 1200, negativeVotes: 50, tradeCount: 1, totalTrades: 1250 },
        pairAddress: 'pair_address_here'
    },
    'SOL': {
        name: 'Solana',
        symbol: 'SOL',
        mintAddress: 'So11111111111111111111111111111111111111112',
        logo: React.createElement(SolIcon),
        balance: 0,
        usdValue: 150.00,
        description: { en: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.' },
        security: { isMutable: false, mintAuthorityRevoked: true, freezeAuthorityRevoked: true },
        marketCap: 69000000000,
        volume24h: 2500000000,
        price24hChange: -1.5,
        holders: 1000000,
        circulatingSupply: 460000000,
        poolCreated: 'N/A'
    },
     'USDC': {
        name: 'USD Coin',
        symbol: 'USDC',
        mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
        logo: React.createElement(UsdcIcon),
        balance: 0,
        usdValue: 1.00,
        description: { en: 'USDC is a fully collateralized US dollar stablecoin. It is an Ethereum-powered coin and is the product of a collaboration between Circle and Coinbase.' },
        security: { isMutable: false, mintAuthorityRevoked: false, freezeAuthorityRevoked: false },
        marketCap: 33000000000,
        volume24h: 5000000000,
        price24hChange: 0.01,
        holders: 2000000,
        circulatingSupply: 33000000000,
        poolCreated: 'N/A'
    },
     'USDT': {
        name: 'Tether',
        symbol: 'USDT',
        mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        logo: React.createElement(UsdtIcon),
        balance: 0,
        usdValue: 1.00,
        description: { en: 'Tether (USDT) is a stablecoin pegged to the U.S. dollar. It is issued by the Hong Kong-based company Tether Limited.' },
        security: { isMutable: false, mintAuthorityRevoked: false, freezeAuthorityRevoked: false },
        marketCap: 112000000000,
        volume24h: 53000000000,
        price24hChange: -0.02,
        holders: 4000000,
        circulatingSupply: 112000000000,
        poolCreated: 'N/A'
    }
};
