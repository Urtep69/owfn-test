
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
}

export interface TokenSecurity {
    isMutable: boolean;
    mintAuthorityRevoked: boolean;
    freezeAuthorityRevoked: boolean;
}

export interface TokenAudit {
    contractVerified: boolean;
    isHoneypot: boolean;
    isFreezable: boolean;
    isMintable: boolean;
    alerts: number;
}

export interface CommunityTrust {
    positiveVotes: number;
    negativeVotes: number;
    tradeCount: number;
    totalTrades: number;
}

export interface DextScore {
    score: number;
    maxScore: number;
    points: number[];
}

export interface TokenDetails extends Token {
    description: Record<string, string>;
    security: TokenSecurity;
    marketCap: number;
    volume24h: number;
    price24hChange: number;
    holders: number;
    circulatingSupply: number;
    totalSupply?: number;
    liquidity?: number;
    totalMarketCap?: number;
    volatility?: number;
    totalTx24h?: number;
    pooledSol?: number;
    pooledToken?: number;
    poolCreated?: string;
    dextScore?: DextScore;
    audit?: TokenAudit;
    communityTrust?: CommunityTrust;
    pairAddress?: string;
    fdv?: number;
    pairCreatedAt?: number;
    txns?: {
        h24: { buys: number, sells: number };
    };
    lpBurnedPercent?: number;
    deployerAddress?: string;
    dexId?: string;
}

export interface LiveTransaction {
    id: string;
    time: string;
    type: 'buy' | 'sell';
    price: number;
    amount: number;
    totalUsd?: number;
    priceSol?: number;
    amountSol?: number;
    maker?: string;
    othersCount?: number;
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