

import type { TokenAllocation, RoadmapPhase, Language, SocialCase, TokenDetails, LiveTransaction, VestingSchedule, PresaleTransaction } from './types.ts';
import React from 'react';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from './components/IconComponents.tsx';


export const OWFN_MINT_ADDRESS = 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B';
export const OWFN_LOGO_URL = 'https://www.owfn.org/owfn.png';
export const ADMIN_WALLET_ADDRESS = '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy'; // Admin wallet

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
            nl: 'Financiering voor bouwmaterialen, arbeid en schoolbenodigdheden.',
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
            ro: 'Furnizați consumabile medicale esențiale, inclusiv antibiotice, bandaje și echipamente chirurgicale, unei clinici de primă linie.',
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

export const MOCK_TOKEN_DETAILS: { [key: string]: TokenDetails } = {
  OWFN: {
    name: 'Official World Family Network',
    symbol: 'OWFN',
    mintAddress: 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B',
    pairAddress: '7qAVzrbuLwgIBI3YseqA95Uapf8EVp9jQE5uipqFMoP',
    logo: React.createElement(OwfnIcon),
    balance: 0,
    usdValue: 0.1226,
    description: {
      en: 'The Official World Family Network (OWFN) token is the native cryptocurrency of a global initiative aimed at providing transparent, blockchain-verified aid for social causes, including health, education, and basic needs.',
      ro: 'Token-ul Official World Family Network (OWFN) este criptomoneda nativă a unei inițiative globale care vizează furnizarea de ajutor transparent, verificat prin blockchain, pentru cauze sociale, inclusiv sănătate, educație și nevoi de bază.',
      de: 'Der Official World Family Network (OWFN) Token ist die native Kryptowährung einer globalen Initiative, die darauf abzielt, transparente, blockchain-verifizierte Hilfe für soziale Zwecke, einschließlich Gesundheit, Bildung und Grundbedürfnisse, bereitzustellen.',
      es: 'El token de Official World Family Network (OWFN) es la criptomoneda nativa de una iniciativa global destinada a proporcionar ayuda transparente y verificada por blockchain para causas sociales, incluyendo salud, educación y necesidades básicas.',
      ja: '公式世界家族ネットワーク（OWFN）トークンは、健康、教育、基本的ニーズを含む社会貢献活動のために、透明性が高くブロックチェーンで検証された支援を提供することを目的としたグローバルなイニシアチブのネイティブ暗号通貨です。',
      fr: 'Le jeton Official World Family Network (OWFN) est la cryptomonnaie native d\'une initiative mondiale visant à fournir une aide transparente et vérifiée par la blockchain pour des causes sociales, notamment la santé, l\'éducation et les besoins de base.',
      pt: 'O token da Official World Family Network (OWFN) é a criptomoeda nativa de uma iniciativa global que visa fornecer ajuda transparente e verificada por blockchain para causas sociais, incluindo saúde, educação e necessidades básicas.',
      ru: 'Токен Official World Family Network (OWFN) является нативной криптовалютой глобальной инициативы, направленной на предоставление прозрачной, проверенной блокчейном помощи для социальных целей, включая здравоохранение, образование и основные потребности.',
      it: 'Il token Official World Family Network (OWFN) è la criptovaluta nativa di un\'iniziativa globale volta a fornire aiuti trasparenti e verificati tramite blockchain per cause sociali, tra cui salute, istruzione e bisogni di base.',
      nl: 'De Official World Family Network (OWFN) token is de native cryptovaluta van een wereldwijd initiatief dat tot doel heeft transparante, door blockchain geverifieerde hulp te bieden voor sociale doelen, waaronder gezondheid, onderwijs en basisbehoeften.',
      hu: 'Az Official World Family Network (OWFN) token egy globális kezdeményezés natív kriptovalutája, amelynek célja átlátható, blokklánc-ellenőrzött segítségnyújtás társadalmi célokra, beleértve az egészségügyet, az oktatást és az alapvető szükségleteket.',
      sr: 'Токен Official World Family Network (OWFN) је изворна криптовалута глобалне иницијативе која има за циљ пружање транспарентне, блокчејн-верификоване помоћи у друштвеним циљевима, укључујући здравство, образовање и основне потребе.',
      tr: 'Official World Family Network (OWFN) tokeni, sağlık, eğitim ve temel ihtiyaçlar dahil olmak üzere sosyal amaçlar için şeffaf, blok zinciriyle doğrulanmış yardım sağlamayı amaçlayan küresel bir girişimin yerel kripto para birimidir.',
      ko: '공식 세계 가족 네트워크(OWFN) 토큰은 건강, 교육 및 기본적 필요를 포함한 사회적 대의를 위해 투명하고 블록체인으로 검증된 지원을 제공하는 것을 목표로 하는 글로벌 이니셔티브의 기본 암호화폐입니다.',
      zh: '官方世界家庭网络（OWFN）代币是一项全球倡议的原生加密货币，旨在为包括健康、教育和基本需求在内的社会事业提供透明、经区块链验证的援助。',
    },
    security: {
      isMutable: false,
      mintAuthorityRevoked: true,
      freezeAuthorityRevoked: true,
    },
    marketCap: 134830000,
    volume24h: 158370,
    price24hChange: 4.49,
    holders: 108780,
    circulatingSupply: 1100000000,
    liquidity: 1600000,
    totalMarketCap: 134830000,
    volatility: 0.0957,
    totalTx24h: 82260,
    pooledSol: 4930,
    pooledToken: 6750000,
    poolCreated: '2025-05-26 01:37',
    dextScore: {
      score: 98,
      maxScore: 99,
      points: [81, 99, 99, 99],
    },
    audit: {
      contractVerified: true,
      isHoneypot: false,
      isFreezable: false,
      isMintable: true,
      alerts: 1,
    },
    communityTrust: {
      positiveVotes: 50,
      negativeVotes: 50,
      tradeCount: 115,
      totalTrades: 81880,
    }
  },
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    mintAddress: 'So11111111111111111111111111111111111111112',
    logo: React.createElement(SolIcon),
    balance: 0,
    usdValue: 167.55,
    description: {
      en: 'SOL is the native token of the Solana blockchain. It is used to pay for transaction fees and for staking to secure the network. As the native asset, concepts like mint or freeze authority do not apply in the same way as they do for SPL tokens.',
      ro: 'SOL este token-ul nativ al blockchain-ului Solana. Este folosit pentru a plăti taxele de tranzacție și pentru staking pentru a securiza rețeaua. Ca activ nativ, concepte precum autoritatea de mint sau freeze nu se aplică în același mod ca la token-urile SPL.',
      de: 'SOL ist der native Token der Solana-Blockchain. Er wird zur Bezahlung von Transaktionsgebühren und zum Staking zur Sicherung des Netzwerks verwendet. Als nativer Vermögenswert gelten Konzepte wie Präge- oder Einfrierautorität nicht in derselben Weise wie für SPL-Token.',
      es: 'SOL es el token nativo de la blockchain de Solana. Se utiliza para pagar las tasas de transacción y para el staking para asegurar la red. Como activo nativo, conceptos como la autoridad de acuñación o congelación no se aplican de la misma manera que para los tokens SPL.',
      ja: 'SOLはSolanaブロックチェーンのネイティブトークンです。トランザクション手数料の支払いや、ネットワークを保護するためのステーキングに使用されます。ネイティブアセットとして、SPLトークンのようなミント権限やフリーズ権限の概念は同じようには適用されません。',
      fr: 'SOL est le jeton natif de la blockchain Solana. Il est utilisé pour payer les frais de transaction et pour le staking afin de sécuriser le réseau. En tant qu\'actif natif, des concepts comme l\'autorité de frappe ou de gel ne s\'appliquent pas de la même manière que pour les jetons SPL.',
      pt: 'SOL é o token nativo da blockchain Solana. É usado para pagar taxas de transação e para staking para proteger a rede. Como ativo nativo, conceitos como autoridade de cunhagem ou congelamento não se aplicam da mesma forma que para os tokens SPL.',
      ru: 'SOL — это нативный токен блокчейна Solana. Он используется для оплаты комиссий за транзакции и для стейкинга для защиты сети. Как нативный актив, такие понятия, как право на создание или заморозку, не применяются так же, как к токенам SPL.',
      it: 'SOL è il token nativo della blockchain di Solana. Viene utilizzato per pagare le commissioni di transazione e per lo staking per proteggere la rete. In quanto asset nativo, concetti come l\'autorità di conio o di congelamento non si applicano allo stesso modo dei token SPL.',
      nl: 'SOL is de native token van de Solana-blockchain. Het wordt gebruikt om transactiekosten te betalen en voor staking om het netwerk te beveiligen. Als native asset zijn concepten als mint- of freeze-autoriteit niet op dezelfde manier van toepassing als voor SPL-tokens.',
      hu: 'A SOL a Solana blokklánc natív tokenje. Tranzakciós díjak fizetésére és a hálózat biztosítására szolgáló stakingre használják. Natív eszközként a kibocsátási vagy befagyasztási jogosultságok fogalmai nem ugyanúgy érvényesek, mint az SPL tokenek esetében.',
      sr: 'СОЛ је изворни токен Солана блокчејна. Користи се за плаћање трансакционих накнада и за стејкинг ради обезбеђења мреже. Као изворна имовина, концепти попут овлашћења за ковање или замрзавање не примењују се на исти начин као за СПЛ токене.',
      tr: 'SOL, Solana blok zincirinin yerel tokenidir. İşlem ücretlerini ödemek ve ağı güvence altına almak için staking için kullanılır. Yerel bir varlık olarak, basım veya dondurma yetkisi gibi kavramlar SPL tokenleri için geçerli olduğu gibi uygulanmaz.',
      ko: 'SOL은 솔라나 블록체인의 기본 토큰입니다. 거래 수수료를 지불하고 네트워크를 보호하기 위한 스테이킹에 사용됩니다. 기본 자산으로서 민트 또는 동결 권한과 같은 개념은 SPL 토큰과 동일한 방식으로 적용되지 않습니다.',
      zh: 'SOL 是 Solana 区块链的原生代币。它用于支付交易费用和通过质押来保护网络。作为原生资产，铸造或冻结权限等概念不像 SPL 代币那样适用。',
    },
    security: {
      isMutable: false,
      mintAuthorityRevoked: true,
      freezeAuthorityRevoked: true,
    },
    marketCap: 68000000000,
    volume24h: 2500000000,
    price24hChange: 2.7,
    holders: 2500000,
    circulatingSupply: 462251759,
    liquidity: undefined,
    totalMarketCap: undefined,
    volatility: undefined,
    totalTx24h: undefined,
    pooledSol: undefined,
    pooledToken: undefined,
    poolCreated: 'N/A',
    dextScore: undefined,
    audit: undefined,
    communityTrust: undefined,
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyB7u6a',
    logo: React.createElement(UsdcIcon),
    balance: 0,
    usdValue: 1.00,
    description: {
      en: 'USD Coin (USDC) is a stablecoin that is pegged to the U.S. dollar on a 1:1 basis. It is issued by regulated financial institutions and is fully backed by reserved assets, providing a stable medium of exchange on the Solana network.',
      ro: 'USD Coin (USDC) este un stablecoin care este legat de dolarul american la un raport de 1:1. Este emis de instituții financiare reglementate și este complet susținut de active de rezervă, oferind un mediu de schimb stabil în rețeaua Solana.',
      de: 'USD Coin (USDC) ist ein Stablecoin, der im Verhältnis 1:1 an den US-Dollar gekoppelt ist. Er wird von regulierten Finanzinstituten ausgegeben und ist vollständig durch reservierte Vermögenswerte gedeckt, was ein stabiles Tauschmittel im Solana-Netzwerk bietet.',
      es: 'USD Coin (USDC) es una stablecoin que está vinculada al dólar estadounidense en una base de 1:1. Es emitida por instituciones financieras reguladas y está totalmente respaldada por activos de reserva, proporcionando un medio de intercambio estable en la red de Solana.',
      ja: 'USDコイン（USDC）は、米ドルに1対1でペッグされたステーブルコインです。規制された金融機関によって発行され、準備資産によって完全に裏付けられており、Solanaネットワーク上で安定した交換媒体を提供します。',
      fr: 'USD Coin (USDC) est un stablecoin qui est rattaché au dollar américain sur une base de 1:1. Il est émis par des institutions financières réglementées et est entièrement adossé à des actifs de réserve, offrant un moyen d\'échange stable sur le réseau Solana.',
      pt: 'USD Coin (USDC) é uma stablecoin que está atrelada ao dólar americano na base de 1:1. É emitida por instituições financeiras regulamentadas e é totalmente respaldada por ativos de reserva, fornecendo um meio de troca estável na rede Solana.',
      ru: 'USD Coin (USDC) — это стейблкоин, привязанный к доллару США в соотношении 1:1. Он выпускается регулируемыми финансовыми учреждениями и полностью обеспечен зарезервированными активами, обеспечивая стабильное средство обмена в сети Solana.',
      it: 'USD Coin (USDC) è una stablecoin ancorata al dollaro statunitense su base 1:1. È emessa da istituzioni finanziarie regolamentate ed è completamente supportata da asset di riserva, fornendo un mezzo di scambio stabile sulla rete Solana.',
      nl: 'USD Coin (USDC) is een stablecoin die 1:1 is gekoppeld aan de Amerikaanse dollar. Het wordt uitgegeven door gereguleerde financiële instellingen en wordt volledig gedekt door gereserveerde activa, waardoor het een stabiel ruilmiddel is op het Solana-netwerk.',
      hu: 'Az USD Coin (USDC) egy stabil érme, amely 1:1 arányban van az amerikai dollárhoz kötve. Szabályozott pénzügyi intézmények bocsátják ki, és teljes mértékben tartalékolt eszközökkel van fedezve, stabil csereeszközt biztosítva a Solana hálózaton.',
      sr: 'УСД Коин (УСДЦ) је стабилкоин који је везан за амерички долар у односу 1:1. Издају га регулисане финансијске институције и потпуно је подржан резервним средствима, пружајући стабилно средство размене на Солана мрежи.',
      tr: 'USD Coin (USDC), ABD dolarına 1:1 oranında sabitlenmiş bir stabilcoindir. Düzenlenmiş finansal kurumlar tarafından ihraç edilir ve tamamen ayrılmış varlıklarla desteklenir, Solana ağında istikrarlı bir değişim aracı sağlar.',
      ko: 'USD 코인(USDC)은 미국 달러에 1:1 비율로 고정된 스테이블 코인입니다. 규제된 금융 기관에서 발행하며 예비 자산으로 완전히 뒷받침되어 솔라나 네트워크에서 안정적인 교환 수단을 제공합니다.',
      zh: 'USD Coin (USDC) 是一种与美元 1:1 挂钩的稳定币。它由受监管的金融机构发行，并由储备资产完全支持，在 Solana 网络上提供稳定的交易媒介。',
    },
    security: {
      isMutable: true,
      mintAuthorityRevoked: false,
      freezeAuthorityRevoked: false,
    },
    marketCap: 33000000000,
    volume24h: 5600000000,
    price24hChange: 0.01,
    holders: 3500000,
    circulatingSupply: 33000000000,
    liquidity: undefined,
    totalMarketCap: undefined,
    volatility: undefined,
    totalTx24h: undefined,
    pooledSol: undefined,
    pooledToken: undefined,
    poolCreated: 'N/A',
    dextScore: undefined,
    audit: undefined,
    communityTrust: undefined,
  },
  USDT: {
    name: 'Tether',
    symbol: 'USDT',
    mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    logo: React.createElement(UsdtIcon),
    balance: 0,
    usdValue: 1.00,
    description: {
      en: 'Tether (USDT) is a blockchain-based cryptocurrency whose tokens in circulation are backed by an equivalent amount of U.S. dollars, making it a stablecoin with a 1:1 price peg. It is widely used for trading and transacting on various blockchains, including Solana.',
      ro: 'Tether (USDT) este o criptomonedă bazată pe blockchain ale cărei tokenuri în circulație sunt susținute de o cantitate echivalentă de dolari americani, ceea ce o face un stablecoin cu o paritate de preț 1:1. Este utilizat pe scară largă pentru tranzacționare și transferuri pe diverse blockchain-uri, inclusiv Solana.',
      de: 'Tether (USDT) ist eine Blockchain-basierte Kryptowährung, deren im Umlauf befindliche Token durch einen entsprechenden Betrag an US-Dollar gedeckt sind, was sie zu einem Stablecoin mit einer 1:1-Preisbindung macht. Sie wird häufig für den Handel und Transaktionen auf verschiedenen Blockchains, einschließlich Solana, verwendet.',
      es: 'Tether (USDT) es una criptomoneda basada en blockchain cuyos tokens en circulación están respaldados por una cantidad equivalente de dólares estadounidenses, lo que la convierte en una stablecoin con una paridad de precios de 1:1. Es ampliamente utilizada para comerciar y realizar transacciones en varias blockchains, incluida Solana.',
      ja: 'テザー（USDT）は、流通しているトークンが同額の米ドルに裏付けられたブロックチェーンベースの暗号通貨であり、1対1の価格ペッグを持つステーブルコインです。Solanaを含むさまざまなブロックチェーンで取引やトランザクションに広く使用されています。',
      fr: 'Tether (USDT) est une cryptomonnaie basée sur la blockchain dont les jetons en circulation sont adossés à un montant équivalent de dollars américains, ce qui en fait un stablecoin avec un ancrage de prix de 1:1. Il est largement utilisé pour le trading et les transactions sur diverses blockchains, y compris Solana.',
      pt: 'Tether (USDT) é uma criptomoeda baseada em blockchain cujos tokens em circulação são lastreados por uma quantia equivalente de dólares americanos, tornando-a uma stablecoin com paridade de preço de 1:1. É amplamente utilizada para negociação e transações em várias blockchains, incluindo a Solana.',
      ru: 'Tether (USDT) — это криптовалюта на основе блокчейна, токены которой в обращении обеспечены эквивалентной суммой долларов США, что делает ее стейблкоином с привязкой к цене 1:1. Он широко используется для торговли и транзакций на различных блокчейнах, включая Solana.',
      it: 'Tether (USDT) è una criptovaluta basata su blockchain i cui token in circolazione sono supportati da un importo equivalente di dollari statunitensi, rendendola una stablecoin con un ancoraggio di prezzo 1:1. È ampiamente utilizzata per il trading e le transazioni su varie blockchain, inclusa Solana.',
      nl: 'Tether (USDT) is een op blockchain gebaseerde cryptocurrency waarvan de tokens in omloop worden gedekt door een gelijkwaardig bedrag aan Amerikaanse dollars, waardoor het een stablecoin is met een 1:1 prijskoppeling. Het wordt veel gebruikt voor handel en transacties op verschillende blockchains, waaronder Solana.',
      hu: 'A Tether (USDT) egy blokklánc alapú kriptovaluta, amelynek forgalomban lévő tokenjeit egyenértékű amerikai dollár összeg fedezi, így 1:1 árarányú stabil érmévé válik. Széles körben használják kereskedésre és tranzakciókra különböző blokkláncokon, beleértve a Solanát is.',
      sr: 'Тетер (УСДТ) је криптовалута заснована на блокчејну чији су токени у оптицају подржани еквивалентним износом америчких долара, што га чини стабилкоином са односом цене 1:1. Широко се користи за трговање и трансакције на различитим блокчејновима, укључујући Солану.',
      tr: 'Tether (USDT), dolaşımdaki tokenleri eşdeğer miktarda ABD doları ile desteklenen blok zinciri tabanlı bir kripto para birimidir ve bu da onu 1:1 fiyat sabitliğine sahip bir stabilcoin yapar. Solana dahil olmak üzere çeşitli blok zincirlerinde ticaret ve işlem yapmak için yaygın olarak kullanılır.',
      ko: '테더(USDT)는 유통되는 토큰이 등가의 미국 달러로 뒷받침되는 블록체인 기반 암호화폐로, 1:1 가격 고정을 가진 스테이블 코인입니다. 솔라나를 포함한 다양한 블록체인에서 거래 및 트랜잭션에 널리 사용됩니다.',
      zh: 'Tether (USDT) 是一种基于区块链的加密货币，其流通中的代币由等值的美元支持，使其成为价格 1:1 挂钩的稳定币。它广泛用于包括 Solana 在内的各种区块链上的交易和事务。',
    },
    security: {
      isMutable: true,
      mintAuthorityRevoked: false,
      freezeAuthorityRevoked: false,
    },
    marketCap: 112000000000,
    volume24h: 53000000000,
    price24hChange: -0.02,
    holders: 4200000,
    circulatingSupply: 112000000000,
    liquidity: undefined,
    totalMarketCap: undefined,
    volatility: undefined,
    totalTx24h: undefined,
    pooledSol: undefined,
    pooledToken: undefined,
    poolCreated: 'N/A',
    dextScore: undefined,
    audit: undefined,
    communityTrust: undefined,
  }
};

export const MOCK_LIVE_TRANSACTIONS: LiveTransaction[] = [
    { id: 1, time: '23:40:00', type: 'buy', price: 0.1225, amount: 34.98, totalUsd: 4.28, priceSol: 0.0007317, amountSol: 0.0256, maker: 'J4RVH...pkNN', othersCount: 99 },
    { id: 2, time: '23:32:38', type: 'buy', price: 0.1229, amount: 238.70, totalUsd: 29.34, priceSol: 0.0007317, amountSol: 0.1746, maker: '126d7...prj9', othersCount: 99 },
    { id: 3, time: '23:32:38', type: 'buy', price: 0.1229, amount: 0.0101, totalUsd: 0.0012, priceSol: 0.0007317, amountSol: 0.007405, maker: 'HaPPY...djLf', othersCount: 37 },
    { id: 4, time: '23:32:37', type: 'buy', price: 0.1228, amount: 0.0074, totalUsd: 0.0009, priceSol: 0.0007313, amountSol: 0.005457, maker: 'HaPPY...djLf', othersCount: 37 },
    { id: 5, time: '23:32:37', type: 'buy', price: 0.1228, amount: 3460.64, totalUsd: 425.17, priceSol: 0.0007313, amountSol: 2.53, maker: '3VZVA...VtGa', othersCount: 99 },
    { id: 6, time: '23:32:37', type: 'buy', price: 0.1227, amount: 0.0080, totalUsd: 0.0009, priceSol: 0.0007308, amountSol: 0.005884, maker: 'HaPPY...djLf', othersCount: 37 },
    { id: 7, time: '23:32:37', type: 'buy', price: 0.1227, amount: 1077.39, totalUsd: 132.27, priceSol: 0.0007308, amountSol: 0.7874, maker: '7hk4m...F3vw', othersCount: 1 },
    { id: 8, time: '23:32:36', type: 'buy', price: 0.1227, amount: 133.63, totalUsd: 16.40, priceSol: 0.0007307, amountSol: 0.0976, maker: 'HuTsh...pXIP', othersCount: 2 },
    { id: 9, time: '23:32:36', type: 'buy', price: 0.1226, amount: 3585.57, totalUsd: 439.90, priceSol: 0.0007303, amountSol: 2.62, maker: 'AasQT...GmDx', othersCount: 90 },
    { id: 10, time: '23:32:36', type: 'buy', price: 0.1225, amount: 1938.26, totalUsd: 237.60, priceSol: 0.0007297, amountSol: 1.41, maker: 'rm4co...qBUC', othersCount: 90 },
    { id: 11, time: '23:32:36', type: 'buy', price: 0.1225, amount: 2584.91, totalUsd: 316.66, priceSol: 0.0007292, amountSol: 1.89, maker: '77X6L...6kdr', othersCount: 14 },
    { id: 12, time: '23:32:36', type: 'sell', price: 0.1224, amount: 1377.96, totalUsd: 168.70, priceSol: 0.0007288, amountSol: 1.00, maker: 'CKWXp...39DC', othersCount: 96 },
    { id: 13, time: '23:23:58', type: 'buy', price: 0.1222, amount: 10363.40, totalUsd: 1266.63, priceSol: 0.0007275, amountSol: 7.54, maker: 'CEEXT...8B7C', othersCount: 99 },
    { id: 14, time: '23:22:44', type: 'buy', price: 0.1220, amount: 123.90, totalUsd: 15.11, priceSol: 0.0007264, amountSol: 0.0900, maker: 'J4RVH...pkNN', othersCount: 99 },
    { id: 15, time: '23:20:28', type: 'sell', price: 0.1220, amount: 36854.80, totalUsd: 4499.38, priceSol: 0.0007267, amountSol: 26.78, maker: '8ADss...iL4w', othersCount: 3 },
    { id: 16, time: '23:18:17', type: 'buy', price: 0.1237, amount: 80.79, totalUsd: 9.99, priceSol: 0.0007343, amountSol: 0.0593, maker: '3ymzG...2u9z', othersCount: 1 },
    { id: 17, time: '23:15:25', type: 'buy', price: 0.1237, amount: 727.06, totalUsd: 90.00, priceSol: 0.0007342, amountSol: 0.5338, maker: '3ggji...gvNM', othersCount: 1 },
    { id: 18, time: '23:15:25', type: 'buy', price: 0.1237, amount: 587.32, totalUsd: 72.66, priceSol: 0.0007341, amountSol: 0.4311, maker: 'FpBGq...riHo', othersCount: 51 },
    { id: 19, time: '23:15:25', type: 'buy', price: 0.1236, amount: 255.58, totalUsd: 31.61, priceSol: 0.0007340, amountSol: 0.1876, maker: '9Lad4...BBmW', othersCount: 92 },
    { id: 20, time: '23:15:25', type: 'buy', price: 0.1236, amount: 89.72, totalUsd: 11.09, priceSol: 0.0007339, amountSol: 0.0658, maker: 'EtnwF...YveA', othersCount: 92 },
    { id: 21, time: '23:15:25', type: 'buy', price: 0.1236, amount: 116.30, totalUsd: 14.38, priceSol: 0.0007339, amountSol: 0.0853, maker: 'J14Cg...SsdQ', othersCount: 99 },
];

export const MOCK_STAKING_INFO = {
  totalStaked: 1_250_000_000, // 1.25B
  apy: 15, // 15%
};

export const MOCK_VESTING_SCHEDULES: VestingSchedule[] = [
  {
    recipientAddress: ADMIN_WALLET_ADDRESS, // User can see this schedule
    totalAmount: 50000000, // 50M OWFN
    claimedAmount: 12500000, // 12.5M
    startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), // 6 months ago
    endDate: new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000), // 18 months from now (24 month total)
    cliffDate: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000), // 3 months ago (3 month cliff)
  },
  {
    recipientAddress: 'Ku2VLgYsVeoUnksyj7CunAEubsJHwU8VpdeBmAEfLfq', // Team wallet
    totalAmount: 270000000,
    claimedAmount: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000), // 36 months from now
    cliffDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 month cliff
  },
];

export const MOCK_AIRDROP_ELIGIBLE_WALLETS = [
  ADMIN_WALLET_ADDRESS,
  DISTRIBUTION_WALLETS.team,
  DISTRIBUTION_WALLETS.impactTreasury,
  '3kuRooixcDGcz9yuSi6QbCzuqe2Ud5mtsiy3b6M886Ex', // Marketing wallet
];

export const MOCK_AIRDROP_AMOUNT = 5000;

const generateRandomAddress = () => `${Math.random().toString(36).substring(2, 7)}...${Math.random().toString(36).substring(2, 6)}`;

export const MOCK_PRESALE_TRANSACTIONS: PresaleTransaction[] = Array.from({ length: 20 }).map((_, i) => ({
  id: Date.now() + i,
  address: generateRandomAddress(),
  solAmount: parseFloat((Math.random() * (PRESALE_DETAILS.maxBuy - PRESALE_DETAILS.minBuy) + PRESALE_DETAILS.minBuy).toFixed(2)),
  owfnAmount: 0, // will calculate on the fly
  time: new Date(Date.now() - Math.random() * 1000 * 60 * 60), // within the last hour
}));

MOCK_PRESALE_TRANSACTIONS.forEach(tx => {
  tx.owfnAmount = tx.solAmount * PRESALE_DETAILS.rate;
});