
import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Loader2, ArrowLeft, BarChart3, Droplets, Flame, Users, LockKeyhole, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { SolIcon } from '../components/IconComponents.tsx';
import { DualProgressBar } from '../components/DualProgressBar.tsx';

const formatNumber = (num?: number, options: Intl.NumberFormatOptions = {}) => {
    if (num === null || num === undefined) return 'N/A';
    const defaultOptions: Intl.NumberFormatOptions = {
        maximumFractionDigits: 2,
        ...options,
    };

    if (Math.abs(num) >= 1_000_000_000) {
        return `$${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(num) >= 1_000_000) {
        return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(num) >= 1_000) {
        return `$${(num / 1_000).toFixed(2)}K`;
    }
    return new Intl.NumberFormat('en-US', defaultOptions).format(num);
};

const PriceChangeTicker = ({ label, value }: { label: string, value?: number }) => {
  if (value === undefined || value === null) return null;
  const color = value >= 0 ? 'text-green-500' : 'text-red-500';
  return (
    <div className="text-center bg-primary-100 dark:bg-darkPrimary-800 p-2 rounded-md flex-1">
      <div className="text-xs text-primary-500 dark:text-darkPrimary-400">{label}</div>
      <div className={`text-sm font-bold ${color}`}>{value.toFixed(2)}%</div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="bg-primary-100 dark:bg-darkPrimary-800 p-4 rounded-lg">
        <div className="flex items-center text-primary-500 dark:text-darkPrimary-400 mb-2">
            {icon}
            <span className="text-sm font-semibold ml-2">{label}</span>
        </div>
        <div className="text-xl font-bold text-primary-900 dark:text-darkPrimary-100 truncate">
            {value}
        </div>
    </div>
);


export default function TokenDetail() {
    const { t } = useAppContext();
    const params = useParams();
    const mintAddress = params?.['mint'];

    const [token, setToken] = useState<TokenDetails | null>(null);
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
                    let errorText = `Request failed with status ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorText = errorData.error || errorText;
                    } catch (e) {
                        // Fallback for non-JSON responses
                        const text = await response.text();
                        if (text) {
                             errorText = text;
                        }
                    }
                    throw new Error(errorText);
                }
                const data = await response.json();

                const tokenData: TokenDetails = {
                    ...data,
                    balance: 0,
                    usdValue: 0,
                    description: {},
                    security: { 
                        isMutable: false, 
                        mintAuthorityRevoked: !data.audit?.isMintable, 
                        freezeAuthorityRevoked: !data.audit?.isFreezable 
                    },
                    logo: <GenericTokenIcon uri={data.logo} className="w-12 h-12" />,
                    audit: {
                        isMintable: data.audit?.isMintable ?? false,
                        isFreezable: data.audit?.isFreezable ?? false,
                        contractVerified: null,
                        isHoneypot: null,
                        alerts: 0,
                    },
                    holders: 0, // Placeholder data
                    circulatingSupply: 0, // Placeholder data
                    lpBurnedPercent: 0, // Placeholder data
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
            </div>
        );
    }

    if (error || !token) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                <a href="/" className="text-accent-500 hover:underline mt-4 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> {t('back_to_dashboard')}
                </a>
            </div>
        );
    }
    
    const hasWarnings = token.audit?.isMintable || token.audit?.isFreezable;

    return (
        <div className="space-y-6 text-primary-900 dark:text-darkPrimary-100 animate-fade-in-up bg-primary-50 dark:bg-darkPrimary-950 -m-8 p-8 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-darkPrimary-900 p-6 rounded-xl shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                            {token.logo}
                            <div>
                                <h1 className="text-2xl font-bold">{token.name}</h1>
                                <p className="text-primary-500 dark:text-darkPrimary-400 font-semibold">{token.symbol}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl font-bold tracking-tight">
                                {formatNumber(token.pricePerToken, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                            </p>
                            <div className="flex items-center gap-2 text-lg font-semibold text-primary-600 dark:text-darkPrimary-300">
                                <SolIcon className="w-5 h-5"/>
                                <span>{token.priceSol?.toFixed(6)} SOL</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-darkPrimary-900 p-4 rounded-xl shadow-lg flex gap-2">
                        <PriceChangeTicker label="1H" value={token.priceChange?.h1} />
                        <PriceChangeTicker label="6H" value={token.priceChange?.h6} />
                        <PriceChangeTicker label="24H" value={token.price24hChange} />
                    </div>
                    
                    <div className={`p-6 rounded-xl shadow-lg ${hasWarnings ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            {hasWarnings 
                                ? <AlertTriangle className="w-8 h-8 text-amber-500" />
                                : <CheckCircle className="w-8 h-8 text-green-500" />
                            }
                            <div>
                                <h3 className="text-lg font-bold">{hasWarnings ? t('risk_warnings') : t('risk_passed')}</h3>
                                <p className="text-xs text-primary-600 dark:text-darkPrimary-400">{t('verified_by_owfn')}</p>
                            </div>
                        </div>
                        <p className="text-sm text-primary-700 dark:text-darkPrimary-300">
                            {hasWarnings ? t('risk_factors_found') : t('no_risk_factors_found')}
                        </p>
                    </div>

                    <a
                        href={`https://jup.ag/swap/SOL-${token.mintAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block text-center bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-4 rounded-lg text-lg hover:opacity-90 transition-opacity"
                    >
                        {t('swap')}
                    </a>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-darkPrimary-900 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold mb-2">{t('trading_stats')}</h3>
                        <DualProgressBar
                            label1={t('buys')}
                            value1={token.txns?.h24.buys ?? 0}
                            label2={t('sells')}
                            value2={token.txns?.h24.sells ?? 0}
                        />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <MetricCard icon={<BarChart3 size={20}/>} label={t('market_cap')} value={formatNumber(token.marketCap, {style:'currency', currency: 'USD'})} />
                        <MetricCard icon={<Droplets size={20}/>} label={t('liquidity')} value={formatNumber(token.liquidity, {style:'currency', currency: 'USD'})} />
                        <MetricCard icon={<Flame size={20}/>} label={t('lp_burned')} value={`${token.lpBurnedPercent ?? 0}%`} />
                        {token.deployerAddress && <MetricCard icon={<Users size={20}/>} label={t('deployer')} value={<AddressDisplay address={token.deployerAddress} className="text-base"/>} />}
                        <MetricCard icon={<ShieldCheck size={20}/>} label={t('mint_authority')} value={<span className={token.audit?.isMintable ? 'text-red-500' : 'text-green-500'}>{token.audit?.isMintable ? t('enabled') : t('disabled')}</span>} />
                        <MetricCard icon={<LockKeyhole size={20}/>} label={t('freeze_authority')} value={<span className={token.audit?.isFreezable ? 'text-red-500' : 'text-green-500'}>{token.audit?.isFreezable ? t('enabled') : t('disabled')}</span>} />
                    </div>
                </div>
            </div>
        </div>
    );
}