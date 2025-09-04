

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

export interface TokenDetails extends Token {
    description?: string;
    links?: Record<string, string>;
    marketCap?: number;
    volume24h?: number;
    price24hChange?: number;
    holders?: number;
    totalSupply: number;
    circulatingSupply?: number;
    
    priceSol?: number;
    liquidity?: number;
    pairAddress?: string;
    fdv?: number;
    poolCreatedAt?: number; // Timestamp
    txns?: {
        h24: { buys: number, sells: number };
    };
    dexId?: string;

    // On-chain technical details
    creatorAddress?: string;
    mintAuthority?: string | null;
    freezeAuthority?: string | null;
    updateAuthority?: string | null;
    tokenStandard?: 'SPL Token' | 'Token-2022';
    tokenExtensions?: TokenExtension[];
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

export interface SiwsSession {
  publicKey: string;
  signedAt: number;
}

export interface SiwsReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionLoading: boolean;
  session: SiwsSession | null;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

// Types for the new Community Hub
export interface CommunityUser {
  id: string; // Wallet Address
  username: string;
  avatar: string;
  isOnline: boolean;
  isBot?: boolean;
  bio?: string;
  followers: string[]; // Array of user IDs
  following: string[]; // Array of user IDs
}

export interface CommunityMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  reactions?: { [emoji: string]: string[] }; // emoji -> array of user IDs
}

export interface ChatConversation {
  id: string;
  type: 'dm' | 'group';
  participants: string[]; // Array of user IDs
  name?: string; // For groups
  image?: string; // For groups
  description?: string; // For groups
  isTokenGated?: boolean;
  requiredTokenAmount?: number;
  messages: CommunityMessage[];
  ownerId?: string; // For groups
  moderatorIds?: string[]; // For groups
}