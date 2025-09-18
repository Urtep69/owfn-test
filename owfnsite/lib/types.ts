import type React from 'react';

export type Theme = 'light' | 'dark';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
  timestamp: Date;
  formattedTimestamp: string;
}

export interface PresaleProgress {
  soldSOL: number;
  owfnSold: number;
  contributors: number;
  isLoading: boolean;
}

export interface SocialCase {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  details: Record<string, string>;
  category: string;
  imageUrl: string;
  goal: number;
  donated: number;
}

export interface Token {
  mintAddress: string;
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  pricePerToken: number;
  logo: React.ReactNode | string;
  decimals: number;
}

export interface VestingSchedule {
  recipientAddress: string;
  totalAmount: number;
  claimedAmount: number;
  startDate: Date;
  endDate: Date;
  cliffDate?: Date;
}

export interface GovernanceProposal {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  endDate: Date;
  proposer: string;
  status: 'active' | 'passed' | 'failed';
  votesFor: number;
  votesAgainst: number;
}

export interface PresaleStage {
  phase: number;
  titleKey: string;
  status: 'completed' | 'active' | 'upcoming';
  startDate: string;
  endDate: string;
  rate: number;
  softCap: number;
  hardCap: number;
  minBuy: number;
  maxBuy: number;
  distributionWallet: string;
  bonusTiers: Array<{
    threshold: number;
    percentage: number;
    nameKey: string;
  }>;
}

export interface PresaleTransaction {
  id: string;
  address: string;
  solAmount: number;
  owfnAmount: number;
  time: Date;
}

export interface DonationTransaction {
    id: string;
    address: string;
    amount: number;
    tokenSymbol: string;
    time: Date;
}

export interface Wallet {
  name: string;
  address: string;
  balances: Token[];
  totalUsdValue: number;
}

export interface TokenDetails {
  mintAddress: string;
  name: string;
  symbol: string;
  logo: string | null;
  decimals: number;
  pricePerToken: number;
  totalSupply: number;
  marketCap: number;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  updateAuthority: string | null;
  tokenStandard: string;
  description?: string;
  holders?: number;
  volume24h?: number;
}

export interface UserStats {
  stakedBalance: number;
  earnedRewards: number;
  votedProposalIds: string[];
}
