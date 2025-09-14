import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import type { TokenDetails } from '../lib/types.js';
import { 
    Loader2, ArrowLeft, Star, StarOff, AlertTriangle, ExternalLink, BarChart2, Briefcase, 
    ShieldCheck, Info, Globe, Twitter, Send, Wrench
} from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { GenericTokenIcon } from '../components/IconComponents.js';
import { formatNumber } from '../lib/utils.js';
import { PriceChart } from '../components/PriceChart.js';

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
    // Fix: Destructuring from useParams was causing a type error.
    // Changed to get params object and then access mint property via index.
    const params = useParams();
    const mint = params?.['mint'];
    const [location] = useLocation();
    
    const [tokenData, setTokenData] = useState<TokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fix: `location` from `useLocation` is the pathname string, so `location.search` is a function.
    // Use `window.location.search` to correctly parse URL query parameters.
    // Also updated dependency array to `[location]` to re-evaluate when the path changes.
    const fromPath = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('from') || '/dashboard';
    }, [location]);

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

        const interval = setInterval(fetchTokenData, 5000); // Auto-refresh data every 5 seconds
        fetchTokenData(); // Initial fetch

        return () => clearInterval(interval); // Cleanup interval on unmount
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
                            {isFavorite ? <Star className="text-yellow-500 fill-current" size={20} /> : <Star size={20} />}
                        </button>
                        <a href={`https://solscan.io/token/${tokenData.mintAddress}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-primary-100 dark:bg-darkPrimary-700 hover:bg-primary-200 dark:hover:bg-darkPrimary-600 transition-colors" aria-label="View on Solscan">
                            <ExternalLink size={20} />
                        </a>
                        <div className="text-right">
                             <p className="text-3xl font-bold font-mono">${tokenData.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
                             <p className={`text-sm font-semibold ${tokenData.price24hChange && tokenData.price24hChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tokenData.price24hChange && tokenData.price24hChange >= 0 ? '↗' : '↘'} {Math.abs(tokenData.price24hChange ?? 0).toFixed(2)}% (24h)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-primary-200/50 dark:bg-darkPrimary-800/50 rounded-lg text-center font-semibold text-primary-600 dark:text-darkPrimary-400">
                {t('swap_coming_soon')}
            </div>

            {/* Main Grid: Chart on Left, Details on Right */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <PriceChart mintAddress={tokenData.mintAddress} />
                    {tokenData.description && (
                         <Section title={t('token_description_title')} icon={<Info />}>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{tokenData.description}</p>
                        </Section>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-8">
                    <Section title={t('market_stats')} icon={<BarChart2 />}>
                        <DetailRow label={t('market_cap')} value={`$${formatNumber(tokenData.marketCap ?? 0)}`} />
                        <DetailRow label={t('volume_24h')} value={`$${formatNumber(tokenData.volume24h ?? 0)}`} />
                        <DetailRow label={t('circulating_supply')} value={`${formatNumber(tokenData.circulatingSupply ?? 0)}`} />
                        <DetailRow label={t('total_supply')} value={formatNumber(tokenData.totalSupply)} />
                        <DetailRow label={t('holders')} value={formatNumber(tokenData.holders ?? 0)} />
                        <DetailRow label={t('fully_diluted_valuation')} value={`$${formatNumber(tokenData.pricePerToken * tokenData.totalSupply)}`} />
                    </Section>

                     <Section title={t('on_chain_security')} icon={<ShieldCheck />}>
                        <DetailRow label={t('mint_authority')} value={tokenData.mintAuthority ? <AddressDisplay address={tokenData.mintAuthority}/> : <span className="text-green-500 font-bold">{t('revoked')}</span>} />
                        <DetailRow label={t('freeze_authority')} value={tokenData.freezeAuthority ? <AddressDisplay address={tokenData.freezeAuthority}/> : <span className="text-green-500 font-bold">{t('revoked')}</span>} />
                        <DetailRow label={t('update_authority')} value={tokenData.updateAuthority ? <AddressDisplay address={tokenData.updateAuthority}/> : 'N/A'} />
                        <DetailRow label={t('creatorAddress')} value={tokenData.creatorAddress ? <AddressDisplay address={tokenData.creatorAddress} /> : 'N/A'} />
                     </Section>
                     
                     <Section title={t('technical_details_title', { defaultValue: 'Technical Details'})} icon={<Wrench />}>
                        <DetailRow label={t('token_standard')} value={tokenData.tokenStandard} />
                        <DetailRow label={t('token_decimals')} value={tokenData.decimals} />
                        <DetailRow label={t('pool_age')} value={tokenData.createdAt ? new Date(tokenData.createdAt * 1000).toLocaleDateString() : 'N/A'} />
                     </Section>

                    {tokenData.liquidityPools && tokenData.liquidityPools.length > 0 && (
                        <Section title={t('pool_info')} icon={<Briefcase />}>
                            {tokenData.liquidityPools.map(pool => (
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
                            ))}
                        </Section>
                    )}

                     {tokenData.links && (Object.values(tokenData.links).some(l => l)) && (
                        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                            <div className="flex justify-center items-center gap-6">
                                {tokenData.links.website && <a href={tokenData.links.website} target="_blank" rel="noopener noreferrer" aria-label="Website" className="text-primary-600 hover:text-accent-500 dark:text-darkPrimary-400 dark:hover:text-darkAccent-400"><Globe size={22}/></a>}
                                {tokenData.links.twitter && <a href={tokenData.links.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-primary-600 hover:text-accent-500 dark:text-darkPrimary-400 dark:hover:text-darkAccent-400"><Twitter size={22}/></a>}
                                {tokenData.links.telegram && <a href={tokenData.links.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-primary-600 hover:text-accent-500 dark:text-darkPrimary-400 dark:hover:text-darkAccent-400"><Send size={22}/></a>}
                            </div>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
}