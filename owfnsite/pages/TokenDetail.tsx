
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import type { TokenDetails } from '../lib/types.js';
import { 
    Loader2, ArrowLeft, Star, StarOff, AlertTriangle, ExternalLink, BarChart2, Briefcase, 
    ShieldCheck, Info, Globe, Twitter, Send
} from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { GenericTokenIcon } from '../components/IconComponents.js';
import { formatNumber } from '../lib/utils.js';

const StatCard = ({ title, value, change }: { title: string; value: string; change?: number }) => {
    const changeColor = change === undefined ? '' : change >= 0 ? 'text-green-500' : 'text-red-500';
    return (
        <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            <p className="text-2xl font-bold font-mono">{value}</p>
            {change !== undefined && (
                 <p className={`text-sm font-semibold ${changeColor}`}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}% (24h)
                </p>
            )}
        </div>
    );
};

const DetailRow = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-primary-200/50 dark:border-darkPrimary-700/50 last:border-b-0">
        <span className="text-primary-600 dark:text-darkPrimary-400 font-medium mb-1 sm:mb-0">{label}</span>
        <div className="font-semibold text-primary-800 dark:text-darkPrimary-100 text-left sm:text-right break-all w-full sm:w-auto">{value}</div>
    </div>
);

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
            {icon} {title}
        </h2>
        <div className="space-y-1">{children}</div>
    </div>
);

export default function TokenDetail() {
    const { t, favorites, addFavorite, removeFavorite } = useAppContext();
    const { mint } = useParams();
    const [location] = useLocation();
    
    const [tokenData, setTokenData] = useState<TokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fromPath = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get('from') || '/dashboard';
    }, [location.search]);

    useEffect(() => {
        if (!mint) {
            setError(t('token_not_found'));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        
        const fetchTokenData = async () => {
            try {
                const res = await fetch(`/api/token-info?mint=${mint}`);
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `Failed to fetch token data with status ${res.status}`);
                }
                const data: TokenDetails = await res.json();
                setTokenData(data);
            } catch (err) {
                setError((err as Error).message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTokenData();
    }, [mint, t]);

    const isFavorite = useMemo(() => favorites.includes(mint ?? ''), [favorites, mint]);

    const toggleFavorite = () => {
        if (!mint) return;
        if (isFavorite) {
            removeFavorite(mint);
        } else {
            addFavorite(mint);
        }
    };
    
    const backButtonText = fromPath === '/profile' ? t('back_to_profile') : t('back_to_dashboard');

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>;
    }

    if (error || !tokenData) {
        return (
            <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
                <AlertTriangle className="mx-auto w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">{error || t('token_not_found')}</h1>
                <Link to={fromPath}>
                    <a className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline mt-4">
                        <ArrowLeft size={16} /> {backButtonText}
                    </a>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <Link to={fromPath}>
                    <a className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline mb-4">
                        <ArrowLeft size={16} /> {backButtonText}
                    </a>
                </Link>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {tokenData.logo ? <img src={tokenData.logo as string} alt={tokenData.name} className="w-16 h-16 rounded-full" /> : <GenericTokenIcon className="w-16 h-16" />}
                        <div>
                            <h1 className="text-3xl font-bold">{tokenData.name}</h1>
                            <p className="text-lg text-primary-600 dark:text-darkPrimary-400">{tokenData.symbol}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                         <button onClick={toggleFavorite} className="p-3 rounded-full bg-primary-100 dark:bg-darkPrimary-700 hover:bg-primary-200 dark:hover:bg-darkPrimary-600 transition-colors">
                            {isFavorite ? <StarOff size={20} /> : <Star size={20} className="text-yellow-500" />}
                        </button>
                        <div className="text-right">
                             <p className="text-3xl font-bold font-mono">${tokenData.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
                             <p className={`text-sm font-semibold ${tokenData.price24hChange && tokenData.price24hChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tokenData.price24hChange && tokenData.price24hChange >= 0 ? '+' : ''}{tokenData.price24hChange?.toFixed(2)}% (24h)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('market_cap')} value={`$${formatNumber(tokenData.marketCap ?? 0)}`} />
                <StatCard title={t('volume_24h')} value={`$${formatNumber(tokenData.volume24h ?? 0)}`} />
                <StatCard title={t('circulating_supply')} value={`${formatNumber(tokenData.circulatingSupply ?? 0)}`} />
                <StatCard title={t('holders')} value={formatNumber(tokenData.holders ?? 0)} />
            </div>

            {/* Details Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {tokenData.description && (
                         <Section title={t('token_description_title')} icon={<Info />}>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{tokenData.description}</p>
                        </Section>
                    )}
                    <Section title={t('market_stats')} icon={<BarChart2 />}>
                        <DetailRow label={t('total_supply')} value={formatNumber(tokenData.totalSupply)} />
                        <DetailRow label={t('fully_diluted_valuation')} value={`$${formatNumber(tokenData.pricePerToken * tokenData.totalSupply)}`} />
                        <DetailRow label={t('creatorAddress')} value={tokenData.creatorAddress ? <AddressDisplay address={tokenData.creatorAddress} /> : 'N/A'} />
                        <DetailRow label={t('pool_age')} value={tokenData.createdAt ? new Date(tokenData.createdAt * 1000).toLocaleDateString() : 'N/A'} />
                    </Section>
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <Section title={t('on_chain_security')} icon={<ShieldCheck />}>
                        <DetailRow label={t('mint_authority')} value={tokenData.mintAuthority ? <AddressDisplay address={tokenData.mintAuthority}/> : <span className="text-green-500 font-bold">{t('revoked')}</span>} />
                        <DetailRow label={t('freeze_authority')} value={tokenData.freezeAuthority ? <AddressDisplay address={tokenData.freezeAuthority}/> : <span className="text-green-500 font-bold">{t('revoked')}</span>} />
                        <DetailRow label={t('update_authority')} value={tokenData.updateAuthority ? <AddressDisplay address={tokenData.updateAuthority}/> : 'N/A'} />
                     </Section>
                     <Section title={t('pool_info')} icon={<Briefcase />}>
                        {tokenData.liquidityPools && tokenData.liquidityPools.length > 0 ? (
                            tokenData.liquidityPools.map(pool => (
                                <DetailRow 
                                    key={pool.lpMintAddress} 
                                    label={pool.exchange} 
                                    value={
                                        <a href={pool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                                            <AddressDisplay address={pool.lpMintAddress} />
                                            <ExternalLink size={14} />
                                        </a>
                                    } 
                                />
                            ))
                        ) : (
                            <p className="text-sm text-primary-500 dark:text-darkPrimary-500 text-center">No liquidity pools found.</p>
                        )}
                     </Section>
                     {tokenData.links && (Object.values(tokenData.links).some(l => l)) && (
                        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                            <div className="flex justify-center items-center gap-4">
                                {tokenData.links.website && <a href={tokenData.links.website} target="_blank" rel="noopener noreferrer" aria-label="Website"><Globe/></a>}
                                {tokenData.links.twitter && <a href={tokenData.links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter/></a>}
                                {tokenData.links.telegram && <a href={tokenData.links.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><Send/></a>}
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}
