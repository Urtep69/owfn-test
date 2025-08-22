import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Loader2, ArrowLeft, Database, Shield, Code, TrendingUp, DollarSign, BarChart2, Repeat, Droplets, Clock, ArrowRightLeft, FileText, Link as LinkIcon, Globe, Twitter, Send, ExternalLink, Users, Package } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { DualProgressBar } from '../components/DualProgressBar.tsx';
import { DiscordIcon } from '../components/IconComponents.tsx';
import { TokenSecurityInfo } from '../components/TokenSecurityInfo.tsx';
import { LiveTransactionFeed } from '../components/LiveTransactionFeed.tsx';


// --- Helper Functions & Components ---
const formatLargeNumber = (num?: number): string => {
    if (num === undefined || num === null) return 'N/A';
    if (num < 1000) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num < 1_000_000) return `${(num / 1000).toFixed(2)}K`;
    if (num < 1_000_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    return `${(num / 1_000_000_000).toFixed(2)}B`;
};
const StatCard = ({ title, value, change, icon }: { title: string, value: string, change?: number, icon: React.ReactNode }) => (
    <div className="glassmorphism p-4 rounded-xl border border-border-color/50 shadow-card">
        <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-accent/10 to-accent-light/10 text-accent-light rounded-lg p-3">{icon}</div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold font-display text-text-primary">{value}</p>
                    {change !== undefined && (
                        <p className={`text-sm font-bold ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);
const InfoCard = ({ title, icon, children, cardClass = "" }: { title: string, icon: React.ReactNode, children: React.ReactNode, cardClass?: string }) => (
    <div className={`glassmorphism p-6 rounded-lg shadow-card ${cardClass}`}>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-primary font-display">{icon}{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);
const InfoRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 border-b border-border-color/50 last:border-b-0">
        <span className="text-sm text-text-secondary">{label}</span>
        <div className="text-sm font-semibold text-text-primary text-right break-all">{children}</div>
    </div>
);
const LinkButton = ({ href, icon, text }: { href: string, icon: React.ReactNode, text: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex-grow flex items-center justify-center gap-2 bg-surface-dark hover:bg-surface-dark/80 text-text-primary font-semibold py-2 px-3 rounded-md transition-colors border border-border-color">
        {icon}{text}
    </a>
);


export default function TokenDetail() {
    const { t } = useAppContext();
    const params = useParams();
    const [location] = useLocation();
    const mintAddress = params?.['mint'];
    
    const query = new URLSearchParams(location.split('?')[1] || '');
    const fromPath = query.get('from') || '/dashboard';
    const backLinkText = fromPath === '/profile' ? t('back_to_profile') : t('back_to_dashboard');

    const [token, setToken] = useState<Partial<TokenDetails> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
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

    if (loading) return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-accent-light"/></div>;
    if (error || !token) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-danger mt-2">{error}</p>}
                <Link to={fromPath} className="text-accent hover:underline mt-4 inline-flex items-center gap-2"><ArrowLeft size={16} /> {backLinkText}</Link>
            </div>
        );
    }
    
    const isMarketDataAvailable = (token.marketCap ?? 0) > 0;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-accent hover:underline"><ArrowLeft size={16} /> {backLinkText}</Link>

            {/* Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <GenericTokenIcon uri={token.logo as string} className="w-16 h-16 flex-shrink-0" />
                <div className="flex-grow">
                    <h1 className="text-3xl font-bold font-display">{token.name}</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-text-secondary font-semibold text-lg">${token.symbol}</p>
                        {token.mintAddress && <AddressDisplay address={token.mintAddress} type="token" />}
                    </div>
                </div>
                {isMarketDataAvailable && token.mintAddress && (
                    <a href={`https://jup.ag/swap/SOL-${token.mintAddress}`} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-accent to-accent-light text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                        {t('swap')} <ExternalLink size={16} />
                    </a>
                )}
            </header>
            
            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-start">
                
                {/* Main Content (Left & Center Columns) */}
                <div className="lg:col-span-2 xl:col-span-3 space-y-8">
                     {isMarketDataAvailable && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatCard title={t('pricePerToken', {defaultValue: 'Price'})} value={`$${token.pricePerToken?.toPrecision(4)}`} change={token.price24hChange} icon={<DollarSign />} />
                            <StatCard title={t('market_cap')} value={`$${formatLargeNumber(token.marketCap)}`} icon={<BarChart2 />} />
                            <StatCard title={t('volume_24h')} value={`$${formatLargeNumber(token.volume24h)}`} icon={<Repeat />} />
                        </div>
                     )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                         <InfoCard title={t('market_stats')} icon={<TrendingUp />}>
                            <InfoRow label={t('fully_diluted_valuation')}>{`$${formatLargeNumber(token.fdv)}`}</InfoRow>
                            <InfoRow label={t('liquidity')}>{`$${formatLargeNumber(token.liquidity)}`}</InfoRow>
                            <InfoRow label={t('holders')}>{token.holders?.toLocaleString() ?? 'N/A'}</InfoRow>
                            <InfoRow label={t('circulating_supply')}>{token.circulatingSupply ? formatLargeNumber(token.circulatingSupply) : 'N/A'}</InfoRow>
                        </InfoCard>
                        
                         <InfoCard title={t('trading_stats')} icon={<ArrowRightLeft />}>
                            <DualProgressBar value1={token.txns?.h24.buys ?? 0} label1={t('buys')} value2={token.txns?.h24.sells ?? 0} label2={t('sells')} />
                            <InfoRow label={t('total_transactions_24h')}>{(token.txns?.h24.buys ?? 0) + (token.txns?.h24.sells ?? 0)}</InfoRow>
                            <InfoRow label={t('pool_age')}>{token.poolCreatedAt ? new Date(token.poolCreatedAt).toLocaleDateString() : 'N/A'}</InfoRow>
                        </InfoCard>
                    </div>

                    <LiveTransactionFeed pairAddress={token.pairAddress} />
                </div>

                {/* Sidebar (Right Column) */}
                <div className="lg:col-span-1 xl:col-span-1 space-y-8">
                     {token.description && (
                        <InfoCard title={t('token_description_title')} icon={<FileText />}>
                            <p className="text-sm text-text-secondary leading-relaxed">{token.description}</p>
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

                    <TokenSecurityInfo token={token} />

                    <InfoCard title={t('on_chain_security')} icon={<Shield />}>
                         <InfoRow label={t('total_supply')}>{token.totalSupply?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</InfoRow>
                         <InfoRow label={t('token_standard')}>{token.tokenStandard}</InfoRow>
                         <InfoRow label="Creator"><AddressDisplay address={token.creatorAddress ?? 'Unknown'} /></InfoRow>
                         <InfoRow label={t('mint_authority')}>{token.mintAuthority ? <AddressDisplay address={token.mintAuthority} /> : <span className="text-success font-bold">{t('revoked')}</span>}</InfoRow>
                         <InfoRow label={t('freeze_authority')}>{token.freezeAuthority ? <AddressDisplay address={token.freezeAuthority} /> : <span className="text-success font-bold">{t('revoked')}</span>}</InfoRow>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
}