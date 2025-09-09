import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTheme } from '../hooks/useTheme.ts';
import { useLocalization } from '../hooks/useLocalization.ts';
import { useSolana } from '../hooks/useSolana.ts';
import type { Theme, Language, SocialCase, Token, VestingSchedule, GovernanceProposal } from '../types.ts';
import { INITIAL_SOCIAL_CASES, SUPPORTED_LANGUAGES, MAINTENANCE_MODE_ACTIVE } from '../constants.ts';

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
  addProposal: (proposal: { title: string; description: string; }) => Promise<void>;
  voteOnProposal: (proposalId: number, vote: 'for' | 'against') => Promise<void>;
  fetchProposals: () => Promise<void>;
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

  const fetchProposals = useCallback(async () => {
    try {
        const res = await fetch('/api/governance');
        if (res.ok) {
            const data = await res.json();
            setProposals(data.proposals || []);
        } else {
            console.error("Failed to fetch proposals");
        }
    } catch (error) {
        console.error("Error fetching proposals:", error);
    }
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const addSocialCase = (newCase: SocialCase) => {
    setSocialCases(prevCases => [newCase, ...prevCases]);
  };
  
  const addVestingSchedule = (schedule: VestingSchedule) => {
    setVestingSchedules(prev => [schedule, ...prev]);
  };

  const addProposal = useCallback(async (proposalData: { title: string; description: string; }) => {
    const result = await solana.createProposal(proposalData.title, proposalData.description);
    if (result.success && result.newProposal) {
        setProposals(prev => [result.newProposal!, ...prev]);
        alert(t(result.messageKey));
    } else {
        alert(t(result.messageKey));
    }
  }, [solana, t]);
  
  const voteOnProposal = useCallback(async (proposalId: number, vote: 'for' | 'against') => {
     const result = await solana.voteOnProposal(proposalId, vote);
     if (result.success && result.updatedProposal) {
         setProposals(prev => prev.map(p => p.id === result.updatedProposal!.id ? result.updatedProposal! : p));
         alert(t(result.messageKey));
     } else {
         alert(t(result.messageKey));
     }
  }, [solana, t]);

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
    fetchProposals,
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