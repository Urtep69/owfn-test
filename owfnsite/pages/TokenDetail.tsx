import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Loader2, ArrowLeft, Shield, DollarSign, FileText, BarChart2, TrendingUp, Users, Droplets, Info } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { DualProgressBar } from '../components/DualProgressBar.tsx';
import { MOCK_TOKEN_DETAILS } from '../constants.ts';

const StatCard = ({ title, value, subtext, icon, valueColor = 'text-primary-900 dark:text-darkPrimary-100', subtextColor }: { title: string, value: string, subtext?: string, icon: React.ReactNode, valueColor?: string, subtextColor?: string }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-xl shadow-3d">
        <div className="flex items-center space-x-3">
            <div className="bg-primary-100 dark:bg-darkPrimary-700 text-accent-500 dark:text-darkAccent-400 rounded-lg p-3">{icon}</div>
            <div>
                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
                </div>
                 {subtext && <p className={`text-xs font-semibold ${subtextColor}`}>{subtext}</p>}
            </div>
        </div>
    </div>
);

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d h-full">
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
                    let errorMsg = `Error: ${response.status} ${response.statusText}`;
                    const errorText = await response.text(); // Read body once as text
                    try {
                        // Try parsing it as JSON
                        const errorData = JSON.parse(errorText);
                        errorMsg = errorData.error || errorMsg;
                    } catch (e) {
                         // If it's not JSON, use the raw text (or a snippet)
                        errorMsg = errorText.substring(0, 200) || errorMsg;
                    }
                    throw new Error(errorMsg);
                }
                
                const data: TokenDetails = await response.json();

                const mockDetailsKey = Object.keys(MOCK_TOKEN_DETAILS).find(key => MOCK_TOKEN_DETAILS[key].mintAddress === mintAddress);
                if (mockDetailsKey) {
                    const mock = MOCK_TOKEN_DETAILS[mockDetailsKey];
                    data.description = data.description || mock.description;
                    // Mock data for trading stats for demonstration
                    data.txns = data.txns || mock.txns; 
                }
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
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('price_per_token')} value={isPriceAvailable ? `$${priceString}`: 'N/A'} icon={<DollarSign />} subtext={`${priceChange.toFixed(2)}% (24h)`} subtextColor={priceChangeColor} />
                <StatCard title={t('market_cap')} value={token.marketCap ? `$${(token.marketCap).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'} icon={<BarChart2 />} />
                <StatCard title={t('volume_24h')} value={token.volume24h ? `$${(token.volume24h).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'} icon={<TrendingUp />} />
                <StatCard title={t('holders')} value={token.holders ? token.holders.toLocaleString() : 'N/A'} icon={<Users />} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <InfoCard title={t('market_stats')} icon={<Info />}>
                        <InfoRow label={t('fully_diluted_valuation')}>{token.fdv ? `$${token.fdv.toLocaleString(undefined, {maximumFractionDigits: 0})}` : 'N/A'}</InfoRow>
                        <InfoRow label={t('liquidity')}>{token.liquidity ? `$${token.liquidity.toLocaleString(undefined, {maximumFractionDigits: 0})}` : 'N/A'}</InfoRow>
                    </InfoCard>

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
                </div>
                
                <div className="lg:col-span-1 space-y-8">
                     <InfoCard title={t('on_chain_security')} icon={<Shield />}>
                        <InfoRow label={t('total_supply')}>{token.totalSupply?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</InfoRow>
                        <InfoRow label={t('token_standard')}>{token.tokenStandard || 'N/A'}</InfoRow>
                         {token.creatorAddress && (
                            <InfoRow label={"Creator Address"}>
                                <AddressDisplay address={token.creatorAddress} />
                            </InfoRow>
                        )}
                        <AuthorityRow label={t('mint_authority')} address={token.mintAuthority} />
                        <AuthorityRow label={t('freeze_authority')} address={token.freezeAuthority} />
                        <AuthorityRow label={t('update_authority')} address={token.updateAuthority} />
                    </InfoCard>

                    {token.description && (
                        <InfoCard title={t('token_description_title')} icon={<FileText />}>
                            <p className="text-sm text-primary-700 dark:text-darkPrimary-300 leading-relaxed">{token.description}</p>
                        </InfoCard>
                    )}
                </div>
            </div>
        </div>
    );
}
