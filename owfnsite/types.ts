


export interface Token {
  name: string;
  symbol: string;
  mintAddress: string;
  logo: string | React.ReactNode;
  balance: number;
  usdValue: number;
  decimals: number;
  pricePerToken: number;
}

export interface Wallet {
  name: string;
  address: string;
  balances: Token[];
  totalUsdValue: number;
}

export interface TokenAllocation {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface RoadmapPhase {
  quarter: string;
  key_prefix: string;
}

export interface SocialCase {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  category: string;
  imageUrl: string;
  goal: number;
  donated: number;
  details: Record<string, string>;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export type Theme = 'light' | 'dark';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    timestamp?: Date;
}

export interface TokenExtensionState {
  [key: string]: any;
}

export interface TokenExtension {
    extension: string;
    state: TokenExtensionState;
}

export interface LiquidityPool {
    dexId?: string;
    pairAddress?: string;
    liquidity?: number;
    baseToken?: { symbol?: string; address?: string };
    quoteToken?: { symbol?: string; address?: string };
    url?: string;
}

export interface Socials {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
}

export interface TokenDetails extends Token {
    description?: string;
    
    // On-chain technical details
    creatorAddress?: string;
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
    updateAuthority?: string | null;
    tokenStandard?: 'SPL Token' | 'Token-2022';
    tokenExtensions?: TokenExtension[];
    totalSupply: number;
    socials?: Socials;

    // Market Data from DexScreener/Birdeye
    chainId?: string;
    pairAddress?: string;
    liquidity?: { usd: number; base: number; quote: number };
    liquidityPools?: LiquidityPool[];
    volume?: { h24: number; h6: number; h1: number };
    priceChange?: { m5: number; h1: number; h6: number; h24: number };
    fdv?: number; // Fully Diluted Valuation
    holders?: number; // Holder count is hard to get reliably, will be optional
    circulatingSupply?: number; // Will be optional
    baseToken?: { symbol: string; address: string; };
    quoteToken?: { symbol: string; address: string; };
    poolCreatedAt?: number; // Timestamp
    txns?: {
        h24: { buys: number, sells: number, buysVolume: number, sellsVolume: number };
    };
    dexId?: string;
    dexScreenerUrl?: string;
}

export interface Trade {
    timestamp: number;
    type: 'buy' | 'sell';
    priceUsd: number;
    amountQuote: number;
    amountBase: number;
    maker: string;
    txHash: string;
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
  status: 'active' | 'passed' | 'failed';
  votesFor: number;
  votesAgainst: number;
  endDate: Date;
}

export interface ImpactNFT {
    id: string;
    caseId: string;
    caseTitle: string;
    imageUrl: string;
    date: string;
}

export interface ImpactBadge {
    id: string;
    titleKey: string;
    descriptionKey: string;
    icon: React.ReactNode;
}

export interface PresaleTransaction {
  id: string;
  address: string;
  solAmount: number;
  owfnAmount: number;
  time: Date;
}