import React from 'react';

export type Theme = 'light' | 'dark';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface Token {
  mintAddress: string;
  balance: number;
  decimals: number;
  name: string;
  symbol: string;
  logo: React.ReactNode;
  pricePerToken: number;
  usdValue: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp?: Date;
}

export interface SocialCase {
    id: string;
    title: Record<string, string>; // language code -> title
    description: Record<string, string>; // language code -> description
    details: Record<string, string>; // language code -> details
    imageUrl: string;
    goalUSD: number;
    fundedUSD: number;
    category: 'health' | 'education' | 'basic-needs';
    location: {
        country: string;
        city: string;
        lat: number;
        lng: number;
    };
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
    proposer: string;
    endDate: Date;
    status: 'active' | 'passed' | 'failed';
    votesFor: number;
    votesAgainst: number;
}

export interface PresaleTransaction {
    id: string;
    address: string;
    solAmount: number;
    owfnAmount: number;
    time: Date;
}

export interface Wallet {
    name: string;
    address: string;
    balances: Token[];
    totalUsdValue: number;
}

export interface ImpactBadge {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: React.ReactNode;
}

export interface TokenDetails extends Partial<Token> {
    mintAddress: string;
    name: string;
    symbol: string;
    logo: string | React.ReactNode;
    decimals: number;
    pricePerToken?: number;
    totalSupply?: number;
    marketCap?: number;
    volume24h?: number;
    liquidity?: number;
    holders?: number;
    description?: string;
    txns?: {
        h24: {
            buys: number;
            sells: number;
        }
    };
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
    updateAuthority?: string | null;
    tokenStandard?: string;
}
