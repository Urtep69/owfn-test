import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Loader2, ArrowLeft, Shield, DollarSign, FileText, BarChart2, TrendingUp, Users, Info } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { DualProgressBar } from '../components/DualProgressBar.tsx';
import { MOCK_TOKEN_DETAILS } from '../constants.ts';

// FIX: Changed subtext type from 'string' to 'React.ReactNode' to allow JSX elements.
const StatCard = ({ title, value, subtext, icon }: { title: string, value: string, subtext?: React.ReactNode, icon: React.ReactNode }) => (
    <div className="bg-surface border border-border p-4 rounded-lg">
        <div className="flex items-center space-x-3">
            <div className="bg-background text-primary rounded-lg p-3">{icon}</div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-text-primary">{value}</p>
                </div>
                 {subtext && <p className="text-xs font-semibold text-text-secondary">{subtext}</p>}
            </div>
        </div>
    </div>
);

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-surface border border-border p-6 rounded-lg h-full">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-primary">{icon}{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
        <span className="text-sm text-text-secondary">{label}</span>
        <div className="text-sm font-semibold text-text-primary text-right break-all">{children}</div>
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
            {address ? <AddressDisplay address={address} /> : <span className="text-secondary font-bold flex items-center justify-end gap-1.5"><Shield size={14}/> {t('revoked')}</span>}
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
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-primary"/></div>;
    }

    if (error || !token) {
        return (
            <div className="text-center py-10 bg-surface border border-border rounded-lg">
                <h2 className="text-2xl font-bold text-destructive">{t('token_not_found')}</h2>
                {error && <p className="text-text-secondary mt-2 p-4 bg-background rounded-md font-mono text-sm break-all">{error}</p>}
                <Link to={fromPath} className="text-primary hover:underline mt-4 inline-flex items-center gap-2">
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
    const priceChangeColor = priceChange >= 0 ? 'text-secondary' : 'text-destructive';

    return (
        <div className="space-y-8 animate-fade-in-up">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-primary hover:underline">
                <ArrowLeft size={16} /> {backLinkText}
            </Link>

            <header className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <GenericTokenIcon uri={token.logo as string} className="w-16 h-16 flex-shrink-0" />
                <div className="flex-grow">
                    <h1 className="text-3xl font-bold">{token.name}</h1>
                    <p className="text-text-secondary font-semibold text-lg">${token.symbol}</p>
                </div>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title={t('price_per_token')} value={isPriceAvailable ? `$${priceString}`: 'N/A'} icon={<DollarSign />} subtext={<span className={priceChangeColor}>{`${priceChange.toFixed(2)}% (24h)`}</span>} />
                <StatCard title={t('market_cap')} value={token.marketCap ? `$${(token.marketCap).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'} icon={<BarChart2 />} />
                <StatCard title={t('volume_24h')} value={token.volume24h ? `$${(token.volume24h).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'} icon={<TrendingUp />} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <InfoCard title={t('market_stats')} icon={<Info />}>
                        <InfoRow label={t('fully_diluted_valuation')}>{token.fdv ? `$${token.fdv.toLocaleString(undefined, {maximumFractionDigits: 0})}` : 'N/A'}</InfoRow>
                        <InfoRow label={t('liquidity')}>{token.liquidity ? `$${token.liquidity.toLocaleString(undefined, {maximumFractionDigits: 0})}` : 'N/A'}</InfoRow>
                        <InfoRow label={t('holders')}>{token.holders ? token.holders.toLocaleString() : 'N/A'}</InfoRow>
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
                        <AuthorityRow label={t('mint_authority')} address={token.mintAuthority} />
                        <AuthorityRow label={t('freeze_authority')} address={token.freezeAuthority} />
                        <AuthorityRow label={t('update_authority')} address={token.updateAuthority} />
                    </InfoCard>

                    {token.description && (
                        <InfoCard title={t('token_description_title')} icon={<FileText />}>
                            <p className="text-sm text-text-secondary leading-relaxed">{token.description}</p>
                        </InfoCard>
                    )}
                </div>
            </div>
        </div>
    );
}