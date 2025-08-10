import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme.ts';
import { useLocalization } from '../hooks/useLocalization.ts';
import { useSolana } from '../hooks/useSolana.ts';
import type { Theme, Language, SocialCase, Token, VestingSchedule, GovernanceProposal } from '../types.ts';
import { INITIAL_SOCIAL_CASES, MOCK_VESTING_SCHEDULES, SUPPORTED_LANGUAGES } from '../constants.ts';
import { translateText } from '../services/geminiService.ts';

const MOCK_PROPOSALS: GovernanceProposal[] = [
    {
        id: 'prop1',
        title: {
            en: 'Fund a new well project in Kenya',
            ro: 'Finanțarea unui nou proiect de fântână în Kenya',
            de: 'Finanzierung eines neuen Brunnenprojekts in Kenia',
            es: 'Financiar un nuevo proyecto de pozo en Kenia',
            ja: 'ケニアでの新しい井戸プロジェクトへの資金提供',
            fr: 'Financer un nouveau projet de puits au Kenya',
            pt: 'Financiar um novo projeto de poço no Quênia',
            ru: 'Финансирование нового проекта колодца в Кении',
            it: 'Finanziare un nuovo progetto di pozzo in Kenya',
            nl: 'Financier een nieuw putproject in Kenia',
            hu: 'Új kútprojekt finanszírozása Kenyában',
            sr: 'Финансирање новог пројекта бунара у Кенији',
            tr: 'Kenya\'da yeni bir kuyu projesini finanse et',
            ko: '케냐의 새로운 우물 프로젝트 자금 지원',
            zh: '资助肯尼亚的一个新水井项目',
        },
        description: {
            en: 'Proposal to allocate 15,000 USDC from the Impact Treasury to fund the construction of a new clean water well, building on our previous successful projects in the region.',
            ro: 'Propunere de alocare a 15.000 USDC din Trezoreria de Impact pentru a finanța construcția unei noi fântâni de apă curată, bazându-se pe proiectele noastre de succes anterioare din regiune.',
            de: 'Vorschlag zur Zuweisung von 15.000 USDC aus der Impact Treasury zur Finanzierung des Baus eines neuen sauberen Wasserbrunnens, aufbauend auf unseren früheren erfolgreichen Projekten in der Region.',
            es: 'Propuesta para asignar 15,000 USDC de la Tesorería de Impacto para financiar la construcción de un nuevo pozo de agua limpia, basándose en nuestros proyectos exitosos anteriores en la región.',
            ja: 'インパクト財務省から15,000 USDCを割り当て、この地域での以前の成功したプロジェクトに基づいて新しいきれいな水の井戸の建設資金とする提案。',
            fr: 'Proposition d\'allouer 15 000 USDC de la Trésorerie d\'Impact pour financer la construction d\'un nouveau puits d\'eau potable, en s\'appuyant sur nos précédents projets réussis dans la région.',
            pt: 'Proposta para alocar 15.000 USDC do Tesouro de Impacto para financiar a construção de um novo poço de água limpa, com base em nossos projetos bem-sucedidos anteriores na região.',
            ru: 'Предложение о выделении 15 000 USDC из Казны влияния для финансирования строительства нового колодца с чистой водой на основе наших предыдущих успешных проектов в регионе.',
            it: 'Proposta di stanziare 15.000 USDC dalla Tesoreria di Impatto per finanziare la costruzione di un nuovo pozzo di acqua pulita, basandosi sui nostri precedenti progetti di successo nella regione.',
            nl: 'Voorstel om 15.000 USDC uit de Impact Treasury toe te wijzen om de bouw van een nieuwe schoonwaterput te financieren, voortbouwend op onze eerdere succesvolle projecten in de regio.',
            hu: 'Javaslat 15 000 USDC elkülönítésére a Hatás Kincstárból egy új tiszta vizű kút építésének finanszírozására, a régióban korábban sikeres projektjeinkre építve.',
            sr: 'Предлог за алокацију 15.000 УСДЦ из Трезора утицаја за финансирање изградње новог бунара чисте воде, надовезујући се на наше претходне успешне пројекте у региону.',
            tr: 'Bölgedeki önceki başarılı projelerimize dayanarak yeni bir temiz su kuyusu inşaatını finanse etmek için Etki Hazinesi\'nden 15.000 USDC tahsis etme teklifi.',
            ko: '이 지역에서 이전에 성공한 프로젝트를 바탕으로 새로운 깨끗한 물 우물 건설 자금을 지원하기 위해 임팩트 재무부에서 15,000 USDC를 할당하는 제안.',
            zh: '提议从影响力金库拨款 15,000 USDC，用于资助建造一口新的清洁水井，这是基于我们之前在该地区成功项目的基础上。',
        },
        proposer: '7vAUf...dvDy',
        status: 'active',
        votesFor: 125800000,
        votesAgainst: 12000000,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
        id: 'prop2',
        title: {
            en: 'Increase Marketing Budget for Q4 2025',
            ro: 'Increase Marketing Budget for Q4 2025',
            de: 'Increase Marketing Budget for Q4 2025',
            es: 'Increase Marketing Budget for Q4 2025',
            ja: 'Increase Marketing Budget for Q4 2025',
            fr: 'Increase Marketing Budget for Q4 2025',
            pt: 'Increase Marketing Budget for Q4 2025',
            ru: 'Increase Marketing Budget for Q4 2025',
            it: 'Increase Marketing Budget for Q4 2025',
            nl: 'Increase Marketing Budget for Q4 2025',
            hu: 'Increase Marketing Budget for Q4 2025',
            sr: 'Increase Marketing Budget for Q4 2025',
            tr: 'Increase Marketing Budget for Q4 2025',
            ko: 'Increase Marketing Budget for Q4 2025',
            zh: 'Increase Marketing Budget for Q4 2025',
        },
        description: {
            en: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            ro: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            de: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            es: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            ja: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            fr: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            pt: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            ru: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            it: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            nl: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            hu: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            sr: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            tr: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            ko: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
            zh: "Allocate an additional 50,000 USDC to the marketing wallet to expand community outreach and form new partnerships.",
        },
        proposer: '3kuRo...86Ex',
        status: 'passed',
        votesFor: 250000000,
        votesAgainst: 45000000,
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
        id: 'prop3',
        title: {
            en: 'Change Token Transfer Fee to 1%',
            ro: 'Change Token Transfer Fee to 1%',
            de: 'Change Token Transfer Fee to 1%',
            es: 'Change Token Transfer Fee to 1%',
            ja: 'Change Token Transfer Fee to 1%',
            fr: 'Change Token Transfer Fee to 1%',
            pt: 'Change Token Transfer Fee to 1%',
            ru: 'Change Token Transfer Fee to 1%',
            it: 'Change Token Transfer Fee to 1%',
            nl: 'Change Token Transfer Fee to 1%',
            hu: 'Change Token Transfer Fee to 1%',
            sr: 'Change Token Transfer Fee to 1%',
            tr: 'Change Token Transfer Fee to 1%',
            ko: 'Change Token Transfer Fee to 1%',
            zh: 'Change Token Transfer Fee to 1%',
        },
        description: {
            en: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            ro: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            de: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            es: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            ja: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            fr: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            pt: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            ru: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            it: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            nl: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            hu: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            sr: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            tr: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            ko: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
            zh: "Proposal to increase the on-chain transfer fee from 0.5% to 1.0% to accelerate Impact Treasury funding.",
        },
        proposer: 'EAS2A...j1fn',
        status: 'failed',
        votesFor: 80000000,
        votesAgainst: 190000000,
        endDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    },
    {
        id: 'prop4',
        title: {
            en: "Partner with 'Educate The Future' NGO",
            ro: "Partner with 'Educate The Future' NGO",
            de: "Partner with 'Educate The Future' NGO",
            es: "Partner with 'Educate The Future' NGO",
            ja: "Partner with 'Educate The Future' NGO",
            fr: "Partner with 'Educate The Future' NGO",
            pt: "Partner with 'Educate The Future' NGO",
            ru: "Partner with 'Educate The Future' NGO",
            it: "Partner with 'Educate The Future' NGO",
            nl: "Partner with 'Educate The Future' NGO",
            hu: "Partner with 'Educate The Future' NGO",
            sr: "Partner with 'Educate The Future' NGO",
            tr: "Partner with 'Educate The Future' NGO",
            ko: "Partner with 'Educate The Future' NGO",
            zh: "Partner with 'Educate The Future' NGO",
        },
        description: {
            en: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            ro: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            de: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            es: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            ja: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            fr: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            pt: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            ru: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            it: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            nl: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            hu: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            sr: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            tr: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            ko: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
            zh: "Formalize a partnership with 'Educate The Future' to co-fund the construction of 3 new schools in Southeast Asia.",
        },
        proposer: '6UokF...AW2',
        status: 'active',
        votesFor: 35000000,
        votesAgainst: 2000000,
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
    }
];

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  setLang: (langCode: string) => void;
  currentLanguage: Language;
  supportedLanguages: Language[];
  solana: ReturnType<typeof useSolana>;
  socialCases: SocialCase[];
  addSocialCase: (newCase: SocialCase) => void;
  vestingSchedules: VestingSchedule[];
  addVestingSchedule: (schedule: VestingSchedule) => void;
  proposals: GovernanceProposal[];
  addProposal: (proposal: { title: string; description: string; endDate: Date }) => Promise<void>;
  voteOnProposal: (proposalId: string, vote: 'for' | 'against') => void;
  isMaintenanceActive: boolean;
  toggleMaintenanceMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, toggleTheme] = useTheme();
  const { t, setLang, currentLanguage, supportedLanguages } = useLocalization();
  const solana = useSolana();
  const [socialCases, setSocialCases] = useState<SocialCase[]>(INITIAL_SOCIAL_CASES);
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>(MOCK_VESTING_SCHEDULES);
  const [proposals, setProposals] = useState<GovernanceProposal[]>(MOCK_PROPOSALS);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('maintenanceMode');
    setIsMaintenanceActive(savedMode === 'true');
  }, []);

  const toggleMaintenanceMode = useCallback(() => {
    setIsMaintenanceActive(prev => {
        const newState = !prev;
        localStorage.setItem('maintenanceMode', String(newState));
        return newState;
    });
  }, []);

  const addSocialCase = (newCase: SocialCase) => {
    setSocialCases(prevCases => [newCase, ...prevCases]);
  };
  
  const addVestingSchedule = (schedule: VestingSchedule) => {
    setVestingSchedules(prev => [schedule, ...prev]);
  };

  const addProposal = useCallback(async (proposalData: { title: string; description: string; endDate: Date; }) => {
    const newTitleTranslations: Record<string, string> = { en: proposalData.title };
    const newDescriptionTranslations: Record<string, string> = { en: proposalData.description };

    const languagesToTranslate = SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en');
    
    try {
        const translationPromises = languagesToTranslate.flatMap(lang => [
            translateText(proposalData.title, lang.name),
            translateText(proposalData.description, lang.name),
        ]);

        const translations = await Promise.all(translationPromises);

        languagesToTranslate.forEach((lang, index) => {
            newTitleTranslations[lang.code] = translations[index * 2] || proposalData.title;
            newDescriptionTranslations[lang.code] = translations[index * 2 + 1] || proposalData.description;
        });
    } catch (error) {
        console.error("Translation failed for proposal:", error);
        // Fallback: use English text for all languages if translation fails
        languagesToTranslate.forEach(lang => {
            newTitleTranslations[lang.code] = proposalData.title;
            newDescriptionTranslations[lang.code] = proposalData.description;
        });
    }
    
    const newProposal: GovernanceProposal = {
        id: `prop${Date.now()}`,
        title: newTitleTranslations,
        description: newDescriptionTranslations,
        endDate: proposalData.endDate,
        proposer: solana.address || 'Anonymous',
        status: 'active',
        votesFor: 0,
        votesAgainst: 0,
    };
    setProposals(prev => [newProposal, ...prev]);
  }, [solana.address]);
  
  const voteOnProposal = useCallback((proposalId: string, vote: 'for' | 'against') => {
    setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
            // Simulate vote based on user's OWFN balance (mocked)
            const votePower = solana.userTokens.find(t => t.symbol === 'OWFN')?.balance || 1000000;
            return {
                ...p,
                votesFor: vote === 'for' ? p.votesFor + votePower : p.votesFor,
                votesAgainst: vote === 'against' ? p.votesAgainst + votePower : p.votesAgainst,
            }
        }
        return p;
    }));
  }, [solana.userTokens]);

  const value = {
    theme,
    toggleTheme,
    t,
    setLang,
    currentLanguage,
    supportedLanguages,
    solana,
    socialCases,
    addSocialCase,
    vestingSchedules,
    addVestingSchedule,
    proposals,
    addProposal,
    voteOnProposal,
    isMaintenanceActive,
    toggleMaintenanceMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};