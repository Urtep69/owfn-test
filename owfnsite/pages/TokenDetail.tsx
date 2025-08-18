import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Loader2, ArrowLeft, BarChart2, DollarSign, TrendingUp, Briefcase, KeyRound, Lock, Unlock, ShieldCheck, Database, Info } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { HELIUS_API_KEY } from '../constants.ts';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { translateText } from '../services/geminiService.ts';

// --- API Interfaces ---
interface HeliusAsset {
    id: string;
    content?: {
        metadata?: {
            name?: string;
            symbol?: string;
            description?: string;
        };
        links?: {
            image?: string;
        };
    };
    token_info?: {
        decimals: number;
        supply: string;
        token_program: string;
        mint_authority?: string;
        freeze_authority?: string;
    };
    authorities?: { address: string, type: string }[];
}

interface DexScreenerPair {
    pairAddress: string;
    dexId: string;
    priceUsd?: string;
    priceChange?: { h24?: number };
    volume?: { h24?: number };
    liquidity?: { usd?: number };
    fdv?: number;
    pairCreatedAt?: number;
    txns?: {
        h24: { buys: number, sells: number };
    };
}

const formatNumber = (num?: number, style: 'currency' | 'decimal' = 'decimal', maximumFractionDigits = 2) => {
    if (num === null || num === undefined) return 'N/A';
    const isCurrency = style === 'currency';
    const prefix = isCurrency ? '$' : '';

    if (Math.abs(num) >= 1_000_000_000) {
        return `${prefix}${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(num) >= 1_000_000) {
        return `${prefix}${(num / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(num) >= 1_000) {
        return `${prefix}${(num / 1_000).toFixed(2)}K`;
    }
    return isCurrency 
        ? num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits }) 
        : num.toLocaleString('en-US', { maximumFractionDigits });
};

const InfoItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-primary-200/50 dark:border-darkPrimary-700/50">
        <span className="text-primary-600 dark:text-darkPrimary-300 text-sm">{label}</span>
        <div className="text-right">
            <span className="font-semibold text-primary-800 dark:text-darkPrimary-100 text-sm font-mono">{value}</span>
        </div>
    </div>
);

const AuthorityStatus = ({ enabled, t, labelKey }: { enabled?: boolean, t: Function, labelKey: string }) => {
    const color = enabled ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    const Icon = enabled ? Unlock : Lock;
    const text = enabled ? 'Enabled' : 'Disabled';

    return (
        <InfoItem 
            label={t(labelKey)} 
            value={
                <div className={`flex items-center justify-end gap-2 font-semibold ${color}`}>
                    <Icon size={14} />
                    <span>{text}</span>
                </div>
            } 
        />
    );
};

const InfoCard = ({ title, icon, children }: { title: string | React.ReactNode, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-lg h-full">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-accent-600 dark:text-darkAccent-400">
            {icon} {title}
        </h3>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

export default function TokenDetail() {
    const { t, currentLanguage } = useAppContext();
    const params = useParams();
    // useLocation from wouter doesn't include search params, so we read them directly.
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get('from');
    
    const mintAddress = params?.['mint'];

    const [token, setToken] = useState<TokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [displayedDescription, setDisplayedDescription] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (!mintAddress) {
            setLoading(false);
            setError('No mint address provided.');
            return;
        }

        const fetchTokenData = async () => {
            setLoading(true);
            setError(null);

            try {
                const heliusPromise = fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 'my-id', method: 'getAsset', params: { id: mintAddress } }),
                });
                const dexscreenerPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
                
                const [heliusRes, dexscreenerRes] = await Promise.all([heliusPromise, dexscreenerPromise]);

                if (!heliusRes.ok) throw new Error(`Helius API failed with status ${heliusRes.status}`);
                const heliusData = await heliusRes.json();
                const asset: HeliusAsset = heliusData.result;
                if (!asset) throw new Error("Could not fetch asset metadata from Helius.");

                let bestPair: DexScreenerPair | null = null;
                if (dexscreenerRes.ok) {
                    const dexscreenerData = await dexscreenerRes.json();
                    if (dexscreenerData.pairs && dexscreenerData.pairs.length > 0) {
                        bestPair = dexscreenerData.pairs
                            .filter((p: any) => p.liquidity && p.liquidity.usd > 1000)
                            .sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
                    }
                }

                const updateAuthority = asset.authorities?.find(a => a.type === 'metadata_update_authority');

                const formatAge = (timestamp?: number) => {
                    if (!timestamp) return 'N/A';
                    const seconds = Math.floor((Date.now() - timestamp) / 1000);
                    const intervals = { year: 31536000, month: 2592000, day: 86400, hour: 3600, minute: 60 };
                    if (seconds < 60) return `${seconds} seconds ago`;
                    if (seconds < intervals.hour) return `${Math.floor(seconds / intervals.minute)} minutes ago`;
                    if (seconds < intervals.day) return `${Math.floor(seconds / intervals.hour)} hours ago`;
                    if (seconds < intervals.month) return `${Math.floor(seconds / intervals.day)} days ago`;
                    if (seconds < intervals.year) return `${Math.floor(seconds / intervals.month)} months ago`;
                    return `${Math.floor(seconds / intervals.year)} years ago`;
                };

                const tokenData: TokenDetails = {
                    mintAddress: asset.id,
                    name: asset.content?.metadata?.name || 'Unknown Token',
                    symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}...`,
                    logo: <GenericTokenIcon uri={asset.content?.links?.image} className="w-12 h-12" />,
                    description: { en: asset.content?.metadata?.description || 'No description provided.' },
                    decimals: asset.token_info?.decimals ?? 0,
                    totalSupply: asset.token_info ? parseFloat(asset.token_info.supply) / Math.pow(10, asset.token_info.decimals || 0) : 0,
                    pricePerToken: bestPair?.priceUsd ? parseFloat(bestPair.priceUsd) : 0,
                    price24hChange: bestPair?.priceChange?.h24 ?? 0,
                    volume24h: bestPair?.volume?.h24 ?? 0,
                    liquidity: bestPair?.liquidity?.usd ?? 0,
                    marketCap: bestPair?.fdv ?? 0,
                    fdv: bestPair?.fdv,
                    pairAddress: bestPair?.pairAddress,
                    txns: bestPair?.txns,
                    totalTx24h: (bestPair?.txns?.h24.buys ?? 0) + (bestPair?.txns?.h24.sells ?? 0),
                    poolCreated: formatAge(bestPair?.pairCreatedAt),
                    dexId: bestPair?.dexId,
                    security: { 
                        isMutable: !!updateAuthority,
                        mintAuthorityRevoked: !asset.token_info?.mint_authority,
                        freezeAuthorityRevoked: !asset.token_info?.freeze_authority,
                    },
                    deployerAddress: updateAuthority?.address,
                    // Interface requirements
                    balance: 0, usdValue: 0, holders: 0, circulatingSupply: 0,
                };
                setToken(tokenData);

            } catch (err) {
                console.error("Failed to fetch token details:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchTokenData();
    }, [mintAddress]);

    useEffect(() => {
        if (!token) return;

        const englishDescription = token.description.en;
        // Show English immediately while waiting for translation
        setDisplayedDescription(englishDescription); 
        
        const noDescriptionText = 'No description provided.';
        if (currentLanguage.code === 'en' || englishDescription === noDescriptionText) {
            setIsTranslating(false);
            return;
        }

        const doTranslate = async () => {
            setIsTranslating(true);
            try {
                const translatedText = await translateText(englishDescription, currentLanguage.name);
                setDisplayedDescription(translatedText);
            } catch (error) {
                console.error("Translation failed:", error);
                // Fallback to English if translation fails
                setDisplayedDescription(englishDescription);
            } finally {
                setIsTranslating(false);
            }
        };

        doTranslate();

    }, [token, currentLanguage]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
                <p className="text-primary-600 dark:text-darkPrimary-400">{t('profile_loading_tokens')}</p>
            </div>
        );
    }
    
    if (error || !token) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                 <Link to={from || '/dashboard'} className="text-accent-500 dark:text-darkAccent-500 hover:underline mt-4 inline-block flex items-center justify-center gap-2">
                    <ArrowLeft size={16} />
                    {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
                </Link>
            </div>
        );
    }

    const priceChangeColor = (token.price24hChange ?? 0) >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    
    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0">{token.logo}</div>
                    <div>
                        <h1 className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100 flex items-center gap-2">
                            {token.name} <span className="text-primary-500 dark:text-darkPrimary-400 text-lg">({token.symbol})</span>
                        </h1>
                    </div>
                </div>
                 <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary-900 dark:text-darkPrimary-100">
                            ${token.pricePerToken < 0.0001 ? token.pricePerToken.toPrecision(4) : token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </span>
                        <span className={`font-semibold ${priceChangeColor}`}>
                            {token.price24hChange?.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title={t('market_stats')} icon={<BarChart2 size={20} />}>
                    <InfoItem label={t('market_cap')} value={formatNumber(token.marketCap, 'currency')} />
                    <InfoItem label={t('fully_diluted_valuation')} value={formatNumber(token.fdv, 'currency')} />
                    <InfoItem label={t('liquidity')} value={formatNumber(token.liquidity, 'currency')} />
                    <InfoItem label={t('volume_24h')} value={formatNumber(token.volume24h, 'currency')} />
                </InfoCard>

                <InfoCard title={t('trading_activity')} icon={<TrendingUp size={20} />}>
                    <InfoItem label={t('buys_24h')} value={token.txns?.h24.buys.toLocaleString() ?? 'N/A'} />
                    <InfoItem label={t('sells_24h')} value={token.txns?.h24.sells.toLocaleString() ?? 'N/A'} />
                    <InfoItem label={t('total_transactions_24h')} value={token.totalTx24h?.toLocaleString() ?? 'N/A'} />
                </InfoCard>

                <InfoCard title={t('token_supply')} icon={<Database size={20} />}>
                    <InfoItem label={t('total_supply')} value={formatNumber(token.totalSupply)} />
                    <InfoItem label={t('decimals')} value={token.decimals} />
                </InfoCard>

                <InfoCard title={t('pool_info')} icon={<Briefcase size={20} />}>
                    <InfoItem label={t('exchange')} value={<span className="capitalize">{token.dexId ?? 'N/A'}</span>} />
                    {token.pairAddress && <InfoItem label={t('pair_address')} value={<AddressDisplay address={token.pairAddress} type="address" />} />}
                    <InfoItem label={t('pool_age')} value={token.poolCreated ?? 'N/A'} />
                </InfoCard>

                <div className="md:col-span-2">
                    <InfoCard title={t('on_chain_security')} icon={<ShieldCheck size={20} />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <AuthorityStatus enabled={!token.security.mintAuthorityRevoked} t={t} labelKey="mint_authority" />
                            <AuthorityStatus enabled={!token.security.freezeAuthorityRevoked} t={t} labelKey="freeze_authority" />
                            {token.deployerAddress && <InfoItem label={t('update_authority')} value={<AddressDisplay address={token.deployerAddress} />} />}
                        </div>
                    </InfoCard>
                </div>
                 {token.description.en !== 'No description provided.' && (
                    <div className="md:col-span-2">
                        <InfoCard 
                            title={
                                <div className="flex items-center gap-2">
                                    <span>{t('token_description_title')}</span>
                                    {isTranslating && <Loader2 className="w-4 h-4 animate-spin"/>}
                                </div>
                            } 
                            icon={<Info size={20} />}
                        >
                            <p className="text-sm text-primary-700 dark:text-darkPrimary-300 whitespace-pre-wrap">{displayedDescription}</p>
                        </InfoCard>
                    </div>
                 )}
            </div>
             <Link to={from || '/dashboard'} className="inline-flex items-center gap-2 text-sm text-accent-600 dark:text-darkAccent-400 hover:underline p-2 mt-2">
                <ArrowLeft size={16} /> {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
            </Link>
        </div>
    );
}