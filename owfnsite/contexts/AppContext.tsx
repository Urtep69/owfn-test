
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTheme } from '../hooks/useTheme.ts';
import { useLocalization } from '../hooks/useLocalization.ts';
import { useSolana } from '../hooks/useSolana.ts';
import { useSiws } from '../hooks/useSiws.ts';
import type { Theme, Language, SocialCase, Token, VestingSchedule, GovernanceProposal, SiwsReturn, BlogPost, Comment } from '../types.ts';
import { SUPPORTED_LANGUAGES, MAINTENANCE_MODE_ACTIVE } from '../constants.ts';
import { STATIC_SOCIAL_CASES, STATIC_BLOG_POSTS } from '../lib/static-data.ts';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  setLang: (langCode: string) => void;
  currentLanguage: Language;
  supportedLanguages: Language[];
  solana: ReturnType<typeof useSolana>;
  siws: SiwsReturn;
  socialCases: SocialCase[];
  blogPosts: BlogPost[];
  isDataLoading: boolean;
  addSocialCase: (newCase: Omit<SocialCase, 'id' | 'createdAt' | 'donated' | 'status'>) => Promise<void>;
  addBlogPost: (newPost: Omit<BlogPost, 'id' | 'createdAt' | 'slug'>) => Promise<void>;
  vestingSchedules: VestingSchedule[];
  addVestingSchedule: (schedule: VestingSchedule) => void;
  proposals: GovernanceProposal[];
  addProposal: (proposal: { title: string; description: string; endDate: Date }) => Promise<void>;
  voteOnProposal: (proposalId: string, vote: 'for' | 'against') => void;
  isMaintenanceActive: boolean;
  setWalletModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, toggleTheme] = useTheme();
  const { t, setLang, currentLanguage, supportedLanguages } = useLocalization();
  const solana = useSolana();
  const siws = useSiws();
  const { setVisible: setWalletModalOpen } = useWalletModal();

  const [socialCases, setSocialCases] = useState<SocialCase[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const isMaintenanceActive = MAINTENANCE_MODE_ACTIVE;

  useEffect(() => {
    setIsDataLoading(true);
    // Load initial data statically to prevent deployment/network errors.
    // A small timeout prevents UI flicker and simulates a loading state.
    const timer = setTimeout(() => {
      try {
        setSocialCases(STATIC_SOCIAL_CASES);
        setBlogPosts(STATIC_BLOG_POSTS);
      } catch (error) {
        console.error("Failed to load static data:", error);
        setSocialCases([]);
        setBlogPosts([]);
      } finally {
        setIsDataLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  const addSocialCase = async (newCaseData: Omit<SocialCase, 'id' | 'createdAt' | 'donated' | 'status'>) => {
    const response = await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCaseData),
    });
    if (response.ok) {
        const newCase = await response.json();
        setSocialCases(prev => [newCase, ...prev]);
    } else {
        throw new Error('Failed to create social case');
    }
  };

  const addBlogPost = async (newPostData: Omit<BlogPost, 'id' | 'createdAt' | 'slug'>) => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPostData),
    });
    if (response.ok) {
        const newPost = await response.json();
        setBlogPosts(prev => [newPost, ...prev]);
    } else {
        throw new Error('Failed to create blog post');
    }
  };
  
  const addVestingSchedule = (schedule: VestingSchedule) => {
    setVestingSchedules(prev => [schedule, ...prev]);
  };

  const addProposal = async (proposalData: { title: string; description: string; endDate: Date; }) => {
    // This remains client-side for now as it's not connected to a DB yet
    const newProposal: GovernanceProposal = {
        id: `prop${Date.now()}`,
        title: { en: proposalData.title },
        description: { en: proposalData.description },
        endDate: proposalData.endDate,
        proposer: solana.address || 'Anonymous',
        status: 'active',
        votesFor: 0,
        votesAgainst: 0,
    };
    setProposals(prev => [newProposal, ...prev]);
  };
  
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
    siws,
    socialCases,
    blogPosts,
    isDataLoading,
    addSocialCase,
    addBlogPost,
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
