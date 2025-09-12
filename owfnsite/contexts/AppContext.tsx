import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTheme } from '../hooks/useTheme.ts';
import { useLocalization } from '../hooks/useLocalization.ts';
import { useSolana } from '../hooks/useSolana.ts';
import type { Theme, Language, SocialCase, Token, VestingSchedule, GovernanceProposal, PresaleStage, PresaleProgress } from '../lib/types.ts';
import { INITIAL_SOCIAL_CASES, SUPPORTED_LANGUAGES, MAINTENANCE_MODE_ACTIVE, PRESALE_STAGES, QUICKNODE_RPC_URL } from '../lib/constants.ts';
import { translateText } from '../services/geminiService.ts';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const currentStage: PresaleStage = PRESALE_STAGES[0];

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
  setWalletModalOpen: (open: boolean) => void;
  presaleProgress: PresaleProgress;
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
  const [presaleProgress, setPresaleProgress] = useState<PresaleProgress>({
    soldSOL: 0,
    owfnSold: 0,
    contributors: 0,
    isLoading: true,
  });

  const fetchPresaleProgress = useCallback(async () => {
    if (new Date() < new Date(currentStage.startDate)) {
        setPresaleProgress({ soldSOL: 0, owfnSold: 0, contributors: 0, isLoading: false });
        return;
    }
    
    setPresaleProgress(prev => ({ ...prev, isLoading: true }));

    try {
        const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
        const presalePublicKey = new PublicKey(currentStage.distributionWallet);
        const presaleStartTimestamp = Math.floor(new Date(currentStage.startDate).getTime() / 1000);

        const signatures = await connection.getSignaturesForAddress(presalePublicKey, { limit: 1000 });
        const relevantSignatures = signatures.filter(sig => sig.blockTime && sig.blockTime >= presaleStartTimestamp);
        
        let totalContributedSOL = 0;
        const contributorSet = new Set<string>();
        
        if (relevantSignatures.length > 0) {
             const transactions = await connection.getParsedTransactions(
                relevantSignatures.map(s => s.signature),
                { maxSupportedTransactionVersion: 0 }
            );

            transactions.forEach(tx => {
                if (tx) {
                    tx.transaction.message.instructions.forEach(inst => {
                        if ('parsed' in inst && inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === currentStage.distributionWallet) {
                            totalContributedSOL += inst.parsed.info.lamports / LAMPORTS_PER_SOL;
                            contributorSet.add(inst.parsed.info.source);
                        }
                    });
                }
            });
        }
        
        setPresaleProgress({
            soldSOL: totalContributedSOL,
            owfnSold: totalContributedSOL * currentStage.rate,
            contributors: contributorSet.size,
            isLoading: false,
        });

    } catch (error) {
        console.error("Failed to fetch presale progress in context:", error);
        setPresaleProgress(prev => ({ ...prev, isLoading: false })); // Stop loading on error
    }
  }, []);

  useEffect(() => {
    fetchPresaleProgress(); // Fetch immediately on mount
    const interval = setInterval(fetchPresaleProgress, 60000); // And then every 60 seconds
    return () => clearInterval(interval);
  }, [fetchPresaleProgress]);

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
  
  const voteOnProposal = useCallback((proposalId: string, vote: 'for' | 'against') => {
    setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
            const votePower = 1000000;
            return {
                ...p,
                votesFor: vote === 'for' ? p.votesFor + votePower : p.votesFor,
                votesAgainst: vote === 'against' ? p.votesAgainst + votePower : p.votesAgainst,
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
    presaleProgress,
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