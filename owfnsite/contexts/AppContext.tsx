import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTheme } from '../hooks/useTheme.ts';
import { useLocalization } from '../hooks/useLocalization.ts';
import { useSolana } from '../hooks/useSolana.ts';
import type { Theme, Language, SocialCase, Token, VestingSchedule, GovernanceProposal } from '../types.ts';
import { INITIAL_SOCIAL_CASES, SUPPORTED_LANGUAGES, MAINTENANCE_MODE_ACTIVE } from '../constants.ts';
import { translateText } from '../services/geminiService.ts';

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
  voteOnProposal: (proposalId: string, vote: 'for' | 'against', revert?: boolean) => void;
  isMaintenanceActive: boolean;
  setWalletModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, toggleTheme] = useTheme();
  const { t, setLang, currentLanguage, supportedLanguages } = useLocalization();
  const solana = useSolana();
  const { setVisible: setWalletModalOpen } = useWalletModal();

  const [socialCases, setSocialCases] = useState<SocialCase[]>(INITIAL_SOCIAL_CASES);
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const isMaintenanceActive = MAINTENANCE_MODE_ACTIVE;

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
  
  const voteOnProposal = useCallback((proposalId: string, vote: 'for' | 'against', revert: boolean = false) => {
    setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
            const votePower = 1000000;
            const change = revert ? -votePower : votePower;
            return {
                ...p,
                votesFor: vote === 'for' ? p.votesFor + change : p.votesFor,
                votesAgainst: vote === 'against' ? p.votesAgainst + change : p.votesAgainst,
            }
        }
        return p;
    }));
  }, []);

  const value: AppContextType = {
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
    setWalletModalOpen,
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