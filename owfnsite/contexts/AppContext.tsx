import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTheme } from '../hooks/useTheme.js';
import { useLocalization } from '../hooks/useLocalization.js';
import { useSolana } from '../hooks/useSolana.js';
import type { Theme, Language, SocialCase, Token, VestingSchedule, GovernanceProposal, PresaleStage, PresaleProgress, Notification, TrackedTransaction } from '../lib/types.js';
import { INITIAL_SOCIAL_CASES, SUPPORTED_LANGUAGES, MAINTENANCE_MODE_ACTIVE, PRESALE_STAGES, QUICKNODE_RPC_URL, ADMIN_WALLET_ADDRESS } from '../lib/constants.js';
import { translateText } from '../services/geminiService.js';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { markJourneyAction } from '../lib/journeyManager.js';

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
  isAdmin: boolean;
  setWalletModalOpen: (open: boolean) => void;
  presaleProgress: PresaleProgress;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  trackedTransaction: TrackedTransaction | null;
  startTrackingTransaction: (tx: Omit<TrackedTransaction, 'status'> & { status: 'sending' }) => void;
  updateTrackedTransactionStatus: (signature: string, status: TrackedTransaction['status']) => void;
  stopTrackingTransaction: () => void;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [trackedTransaction, setTrackedTransaction] = useState<TrackedTransaction | null>(null);
  
  const isAdmin = useMemo(() => solana.address === ADMIN_WALLET_ADDRESS, [solana.address]);
  const isMaintenanceActive = useMemo(() => MAINTENANCE_MODE_ACTIVE && !isAdmin, [isAdmin]);
  
  const [presaleProgress, setPresaleProgress] = useState<PresaleProgress>({
    soldSOL: 0,
    owfnSold: 0,
    contributors: 0,
    isLoading: true,
  });

  // FIX: Moved addNotification and removeNotification definitions before their usage in useEffect.
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Welcome back notification logic
  useEffect(() => {
    try {
        const hasVisited = window.localStorage.getItem('owfn-hasVisited');
        if (hasVisited) {
            addNotification({
                type: 'welcome',
                title: t('welcome_back_title'),
                message: t('welcome_back_message'),
            });
        }
        window.localStorage.setItem('owfn-hasVisited', 'true');
    } catch (error) {
        console.warn("Could not access localStorage for visit tracking", error);
    }
  }, [t, addNotification]);

  // Mark wallet connected journey action
  useEffect(() => {
    if (solana.connected) {
        markJourneyAction('walletConnected');
    }
  }, [solana.connected]);

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
  
  const startTrackingTransaction = useCallback((tx: Omit<TrackedTransaction, 'status'> & { status: 'sending' }) => {
    setTrackedTransaction(tx);
  }, []);

  const updateTrackedTransactionStatus = useCallback((signature: string, status: TrackedTransaction['status']) => {
    setTrackedTransaction(prevTx => {
        if (prevTx && prevTx.signature === signature && prevTx.status !== status) {
            return { ...prevTx, status };
        }
        return prevTx;
    });
  }, []);

  const stopTrackingTransaction = useCallback(() => {
    setTrackedTransaction(null);
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
    isAdmin,
    setWalletModalOpen,
    presaleProgress,
    notifications,
    addNotification,
    removeNotification,
    trackedTransaction,
    startTrackingTransaction,
    updateTrackedTransactionStatus,
    stopTrackingTransaction,
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
