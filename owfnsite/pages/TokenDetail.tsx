import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Loader2, ArrowLeft, Database, Shield, Code, TrendingUp, DollarSign, BarChart2, Repeat, Droplets, Clock, ArrowRightLeft, FileText, Link as LinkIcon, Globe, Twitter, Send, ExternalLink } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { DualProgressBar } from '../components/DualProgressBar.tsx';
import { DiscordIcon } from '../components/IconComponents.tsx';

// --- Helper Functions & Components ---

const formatLargeNumber = (num?: number): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num < 1000) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num < 1_000_000) return `${(num / 1000).toFixed(2)}K`;
    if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    return `${(num / 1_000_000_000).toFixed(2)}B`;
};

const formatTimeAgo = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    const seconds = Math.floor((new Date().getTime() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const StatCard = ({ title, value, change, icon }: { title: string, value: string, change?: number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-xl shadow-3d">
        <div className="flex items-center space-x-3">
            <div className="bg-primary-100 dark:bg-darkPrimary-700 text-accent-500 dark:text-darkAccent-400 rounded-lg p-3">{icon}</div>
            <div>
                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">{value}</p>
                    {change !== undefined && (
                        <p className={`text-sm font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-800 dark:text-darkPrimary-200">{icon}{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 border-b border-primary-200/50 dark:border-darkPrimary-700/50 last:border-b-0">
        <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{label}</span>
        <div className="text-sm font-semibold text-primary-800 dark:text-darkPrimary-200 text-right break-all">{children}</div>
    </div>
);

const LinkButton = ({ href, icon, text }: { href: string, icon: React.ReactNode, text: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex-grow flex items-center justify-center gap-2 bg-primary-100 dark:bg-darkPrimary-700 hover:bg-primary-200 dark:hover:bg-darkPrimary-600 text-primary-700 dark:text-darkPrimary-200 font-semibold py-2 px-3 rounded-md transition-colors">
        {icon}{text}
    </a>
);


// --- Main Component ---

export default function TokenDetail() {
    const { t } = useAppContext();
    const params = useParams();
    const mintAddress = params?.['mint'];
    
    const query = new URLSearchParams(window.location.search);
    const fromPath = query.get('from') || '/dashboard';
    const backLinkText = fromPath === '/profile' ? t('back_to_profile') : t('back_to_dashboard');

    const [token, setToken] = useState<Partial<TokenDetails> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const AuthorityRow = ({ label, address }: { label: string, address?: string | null }) => (
        <InfoRow label={label}>
            {address ? <AddressDisplay address={address} /> : <span className="text-green-500 font-bold">{t('revoked')}</span>}
        </InfoRow>
    );

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
                const response = await fetch(`/api/token-info?mint=${mintAddress}`);
                if (!response.ok) {
                    const errorBody = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
                    throw new Error(errorBody.error || "Failed to fetch token data.");
                }
                setToken(await response.json());
            } catch (err) {
                console.error("Failed to fetch token details:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchTokenData();
    }, [mintAddress]);

    const getLinkIcon = (key: string) => {
        if (key.includes('twitter')) return <Twitter size={16} />;
        if (key.includes('telegram')) return <Send size={16} />;
        if (key.includes('discord')) return <DiscordIcon className="w-4 h-4" />;
        if (key.includes('website')) return <Globe size={16} />;
        return <LinkIcon size={16} />;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>;
    }

    if (error || !token) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                <Link to={fromPath} className="text-accent-500 hover:underline mt-4 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> {backLinkText}
                </Link>
            </div>
        );
    }
    
    const isMarketDataAvailable = (token.marketCap ?? 0) > 0;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {backLinkText}
            </Link>

            <header className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <GenericTokenIcon uri={token.logo as string} className="w-16 h-16 flex-shrink-0" />
                <div className="flex-grow">
                    <h1 className="text-3xl font-bold">{token.name}</h1>
                    <p className="text-primary-500 dark:text-darkPrimary-400 font-semibold text-lg">${token.symbol}</p>
                </div>
                {isMarketDataAvailable && token.mintAddress && (
                    <a href={`https://jup.ag/swap/SOL-${token.mintAddress}`} target="_blank" rel="noopener noreferrer" className="bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2 px-4 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors flex items-center gap-2">
                        {t('swap')} <ExternalLink size={16} />
                    </a>
                )}
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('pricePerToken', {defaultValue: 'Price'})} value={isMarketDataAvailable ? `$${token.pricePerToken?.toPrecision(4)}` : 'N/A'} change={token.price24hChange} icon={<DollarSign />} />
                <StatCard title={t('market_cap')} value={isMarketDataAvailable ? `$${formatLargeNumber(token.marketCap)}` : 'N/A'} icon={<BarChart2 />} />
                <StatCard title={t('volume_24h')} value={isMarketDataAvailable ? `$${formatLargeNumber(token.volume24h)}` : 'N/A'} icon={<Repeat />} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {isMarketDataAvailable ? (
                        <>
                            <InfoCard title={t('market_stats')} icon={<TrendingUp />}>
                                <InfoRow label={t('fully_diluted_valuation')}>{`$${formatLargeNumber(token.fdv)}`}</InfoRow>
                                <InfoRow label={t('liquidity')}>{`$${formatLargeNumber(token.liquidity)}`}</InfoRow>
                                <InfoRow label={t('holders')}>N/A</InfoRow>
                                <InfoRow label={t('circulating_supply')}>N/A</InfoRow>
                            </InfoCard>

                            <InfoCard title={t('trading_stats')} icon={<ArrowRightLeft />}>
                                <DualProgressBar value1={token.txns?.h24.buys ?? 0} label1={t('buys')} value2={token.txns?.h24.sells ?? 0} label2={t('sells')} />
                                <InfoRow label={t('total_transactions_24h')}>{(token.txns?.h24.buys ?? 0) + (token.txns?.h24.sells ?? 0)}</InfoRow>
                            </InfoCard>

                            <InfoCard title={t('pool_info')} icon={<Droplets />}>
                                <InfoRow label={t('pair_address')}><AddressDisplay address={token.pairAddress!} type="address" /></InfoRow>
                                <InfoRow label={t('exchange')}>{token.dexId}</InfoRow>
                                <InfoRow label={t('pool_age')}>{formatTimeAgo(token.poolCreatedAt)}</InfoRow>
                            </InfoCard>
                        </>
                    ) : (
                        <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-inner-3d">
                            <p className="text-primary-600 dark:text-darkPrimary-400">Live market data is not available for this token. It may not be listed on a decentralized exchange yet.</p>
                        </div>
                    )}
                </div>
                
                <div className="lg:col-span-1 space-y-8">
                    {token.description && (
                        <InfoCard title={t('token_description_title')} icon={<FileText />}>
                            <p className="text-sm text-primary-700 dark:text-darkPrimary-300 leading-relaxed">{token.description}</p>
                        </InfoCard>
                    )}
                    
                    {token.links && Object.keys(token.links).length > 0 && (
                        <InfoCard title="Links" icon={<LinkIcon />}>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(token.links).map(([key, href]) => href && (
                                    <LinkButton key={key} href={href} icon={getLinkIcon(key)} text={key.charAt(0).toUpperCase() + key.slice(1)} />
                                ))}
                            </div>
                        </InfoCard>
                    )}

                    <InfoCard title={t('on_chain_security')} icon={<Shield />}>
                        <InfoRow label={t('total_supply')}>{token.totalSupply?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</InfoRow>
                        <InfoRow label="Creator"><AddressDisplay address={token.creatorAddress ?? 'Unknown'} /></InfoRow>
                        <InfoRow label={t('token_standard')}>{token.tokenStandard}</InfoRow>
                        <AuthorityRow label={t('mint_authority')} address={token.mintAuthority} />
                        <AuthorityRow label={t('freeze_authority')} address={token.freezeAuthority} />
                        <AuthorityRow label="Update Authority" address={token.updateAuthority} />
                    </InfoCard>
                </div>
            </div>
        </div>
    );
}