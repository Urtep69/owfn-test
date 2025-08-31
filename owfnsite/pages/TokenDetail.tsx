import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Loader2, ArrowLeft, Shield, DollarSign, FileText, BarChart2, TrendingUp, Users, Droplets, RefreshCw } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon, SolIcon } from '../components/IconComponents.tsx';
import { DualProgressBar } from '../components/DualProgressBar.tsx';

const StatCard = ({ title, value, icon, change, changeColor }: { title: string, value: string, icon: React.ReactNode, change?: string, changeColor?: string }) => (
    <div className="bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-sm p-5 rounded-2xl shadow-3d hover:shadow-3d-lg transition-all duration-300 group perspective-1000">
        <div className="transform-style-3d transition-transform duration-500 group-hover:-translate-y-1">
            <div className="flex items-center gap-3">
                <div className="text-primary-400 dark:text-darkPrimary-500">{icon}</div>
                <p className="text-sm font-semibold text-primary-600 dark:text-darkPrimary-400">{title}</p>
            </div>
            <p className="text-3xl font-bold mt-2 text-primary-900 dark:text-darkPrimary-100">{value}</p>
            {change && <p className={`text-sm font-semibold mt-1 ${changeColor}`}>{change}</p>}
        </div>
    </div>
);


const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-3d hover:shadow-3d-lg transition-all duration-300 group perspective-1000 h-full">
       <div className="transform-style-3d transition-transform duration-500 group-hover:-translate-y-1">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3 text-primary-800 dark:text-darkPrimary-200">{icon}{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    </div>
);

const InfoRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 border-b border-primary-200/50 dark:border-darkPrimary-700/50 last:border-b-0">
        <span className="text-sm text-primary-600 dark:text-darkPrimary-400">{label}</span>
        <div className="text-sm font-semibold text-primary-800 dark:text-darkPrimary-200 text-right break-all">{children}</div>
    </div>
);

const SwapCard = ({ tokenSymbol, tokenLogo }: { tokenSymbol: string, tokenLogo: React.ReactNode }) => {
    const { t, setWalletModalOpen } = useAppContext();
    return (
        <InfoCard title={t('swap')} icon={<RefreshCw size={24} />}>
            <div className="space-y-2">
                <div className="bg-primary-100 dark:bg-darkPrimary-700 p-3 rounded-lg">
                    <div className="flex justify-between text-xs mb-1">
                        <span>{t('you_pay')}</span>
                        <span>{t('balance')}: --</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder="0.0" className="w-full bg-transparent text-2xl font-mono focus:outline-none"/>
                        <div className="flex items-center gap-2 bg-white dark:bg-darkPrimary-800 p-2 rounded-md">
                            <SolIcon className="w-6 h-6" />
                            <span className="font-bold">SOL</span>
                        </div>
                    </div>
                </div>

                <div className="bg-primary-100 dark:bg-darkPrimary-700 p-3 rounded-lg">
                    <div className="flex justify-between text-xs mb-1">
                        <span>{t('you_receive')}</span>
                        <span>{t('balance')}: --</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder="0.0" className="w-full bg-transparent text-2xl font-mono focus:outline-none"/>
                        <div className="flex items-center gap-2 bg-white dark:bg-darkPrimary-800 p-2 rounded-md">
                            {React.cloneElement(tokenLogo as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' })}
                            <span className="font-bold">{tokenSymbol}</span>
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={() => setWalletModalOpen(true)} className="w-full mt-4 bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-8 rounded-lg text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors btn-tactile">
                {t('connect_wallet')}
            </button>
        </InfoCard>
    )
};


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
    
    const AuthorityRow = ({ label, address }: { label: string, address?: string | null }) => (
        <InfoRow label={label}>
            {address ? <AddressDisplay address={address} /> : <span className="text-green-500 font-bold flex items-center justify-end gap-1.5"><Shield size={14}/> {t('revoked')}</span>}
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
                    // When the function crashes, the body is often text from Vercel, not JSON.
                    const errorText = await response.text();
                    // We'll throw this to be caught below and displayed to the user.
                    throw new Error(errorText || `A server error occurred: ${response.status}`);
                }
                
                const data: TokenDetails = await response.json();
                setToken(data);

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
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>;
    }

    if (error || !token) {
        return (
            <div className="text-center py-10 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-inner">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">{t('token_not_found')}</h2>
                {error && <p className="text-primary-600 dark:text-darkPrimary-400 mt-2 p-4 bg-primary-100 dark:bg-darkPrimary-700 rounded-md font-mono text-sm break-all">{error}</p>}
                <Link to={fromPath} className="text-accent-500 dark:text-darkAccent-400 hover:underline mt-4 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> {backLinkText}
                </Link>
            </div>
        );
    }
    
    const isPriceAvailable = (token.pricePerToken ?? 0) > 0;
    const priceString = token.pricePerToken 
        ? (token.pricePerToken > 0.01 
            ? token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) 
            : token.pricePerToken.toPrecision(4))
        : 'N/A';
    const priceChange = token.price24hChange ?? 0;
    const priceChangeColor = priceChange >= 0 ? 'text-green-500' : 'text-red-500';
    const tokenLogo = <GenericTokenIcon uri={token.logo as string} className="w-16 h-16 flex-shrink-0" />;

    return (
        <div className="space-y-8 animate-fade-in-up">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {backLinkText}
            </Link>

            <section className="bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-3d-lg relative overflow-hidden group perspective-1000">
                <div className="absolute -inset-24 bg-gradient-to-br from-accent-400/20 via-transparent to-primary-400/20 dark:from-darkAccent-500/20 dark:to-darkPrimary-500/20 opacity-50 blur-3xl group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-6">
                    {tokenLogo}
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold">{token.name}</h1>
                        <p className="text-primary-500 dark:text-darkPrimary-400 font-semibold text-lg">${token.symbol}</p>
                    </div>
                    <div className="md:ml-auto text-center md:text-right">
                        <p className="text-4xl font-bold">{isPriceAvailable ? `$${priceString}`: 'N/A'}</p>
                        <p className={`text-lg font-semibold ${priceChangeColor}`}>{priceChange.toFixed(2)}% (24h)</p>
                    </div>
                </div>
            </section>

             <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('market_cap')} value={token.marketCap ? `$${(token.marketCap/1_000_000).toFixed(2)}M` : 'N/A'} icon={<BarChart2 />} />
                <StatCard title={t('volume_24h')} value={token.volume24h ? `$${(token.volume24h/1_000_000).toFixed(2)}M` : 'N/A'} icon={<TrendingUp />} />
                <StatCard title={t('liquidity')} value={token.liquidity ? `$${(token.liquidity/1_000).toFixed(2)}k` : 'N/A'} icon={<Droplets />} />
                <StatCard title={t('holders')} value={token.holders ? token.holders.toLocaleString() : 'N/A'} icon={<Users />} />
            </section>


            <section className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <SwapCard tokenSymbol={token.symbol!} tokenLogo={tokenLogo} />
                    {token.description && (
                        <InfoCard title={t('token_description_title')} icon={<FileText />}>
                            <p className="text-sm text-primary-700 dark:text-darkPrimary-300 leading-relaxed">{token.description}</p>
                        </InfoCard>
                    )}
                </div>
                
                <div className="lg:col-span-1 space-y-8">
                    {token.txns && (
                        <InfoCard title={t('trading_stats')} icon={<BarChart2 />}>
                             <DualProgressBar 
                                label1={t('buys')}
                                value1={token.txns.h24.buys}
                                label2={t('sells')}
                                value2={token.txns.h24.sells}
                             />
                             <InfoRow label={t('total_transactions_24h')}>{ (token.txns.h24.buys + token.txns.h24.sells).toLocaleString() }</InfoRow>
                        </InfoCard>
                    )}
                     <InfoCard title={t('on_chain_security')} icon={<Shield />}>
                        <InfoRow label={t('total_supply')}>{token.totalSupply?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</InfoRow>
                        <InfoRow label={t('token_standard')}>{token.tokenStandard || 'N/A'}</InfoRow>
                        <AuthorityRow label={t('mint_authority')} address={token.mintAuthority} />
                        <AuthorityRow label={t('freeze_authority')} address={token.freezeAuthority} />
                        <AuthorityRow label="Update Authority" address={token.updateAuthority} />
                    </InfoCard>
                </div>
            </section>
        </div>
    );
}