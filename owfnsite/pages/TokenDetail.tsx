import React, { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import type { TokenDetails } from '../lib/types.js';
import { ArrowLeft, Loader2, AlertTriangle, Info, BarChart2, ShieldCheck, PieChart, CheckCircle, XCircle } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { formatNumber } from '../lib/utils.js';
import { SEO } from '../components/SEO.js';

const DetailItem = ({ label, value, children }: { label: string, value?: React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-primary-200/50 dark:border-darkPrimary-700/50">
        <span className="text-primary-500 dark:text-darkPrimary-400 mb-1 sm:mb-0">{label}</span>
        <div className="font-semibold text-primary-800 dark:text-darkPrimary-100 text-left sm:text-right break-all w-full sm:w-auto">
            {value ?? children}
        </div>
    </div>
);

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children?: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);

export default function TokenDetail() {
    const { t } = useAppContext();
    const [match, params] = useRoute<{ mint: string }>("/dashboard/token/:mint");
    const [location] = useLocation();
    const mintAddress = match && params ? params.mint : undefined;

    const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fromPath = new URLSearchParams(location.split('?')[1] || '').get('from') || '/dashboard';

    useEffect(() => {
        if (!mintAddress) {
            setError('No mint address provided.');
            setLoading(false);
            return;
        }

        const fetchTokenDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/token-info?mint=${mintAddress}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch token details.');
                }
                const data: TokenDetails = await response.json();
                setTokenDetails(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTokenDetails();
    }, [mintAddress]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-500">{t('token_not_found')}</h2>
                <p className="text-primary-600 dark:text-darkPrimary-400 mt-2">{error}</p>
                <Link to={fromPath} className="mt-6 inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                    <ArrowLeft size={16} /> {t(fromPath.includes('dashboard') ? 'back_to_dashboard' : 'back_to_profile')}
                </Link>
            </div>
        );
    }
    
    if (!tokenDetails) {
        return null;
    }
    
    const { name, symbol, logo } = tokenDetails;
    const seoTitle = t('seo_token_detail_title', { symbol });
    const seoDescription = t('seo_token_detail_description', { name, symbol });

    return (
        <div className="animate-fade-in-up space-y-8">
            <SEO title={seoTitle} description={seoDescription} imageUrl={logo as string} />
            <div>
                <Link to={fromPath} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline mb-4">
                    <ArrowLeft size={16} /> {t(fromPath.includes('dashboard') ? 'back_to_dashboard' : 'back_to_profile')}
                </Link>
                <div className="flex items-center gap-4">
                    {tokenDetails.logo && <img src={tokenDetails.logo as string} alt={tokenDetails.name} className="w-16 h-16 rounded-full" />}
                    <div>
                        <h1 className="text-4xl font-bold">{tokenDetails.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-mono text-primary-500 dark:text-darkPrimary-400">{tokenDetails.symbol}</span>
                            <AddressDisplay address={tokenDetails.mintAddress} type="token" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {tokenDetails.description && (
                        <InfoCard title={t('token_description_title')} icon={<Info />}>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{tokenDetails.description}</p>
                        </InfoCard>
                    )}

                    <InfoCard title={t('market_stats')} icon={<BarChart2 />}>
                         <DetailItem label={t('price_per_token')} value={`$${formatNumber(tokenDetails.pricePerToken)}`} />
                         <DetailItem label={t('market_cap')} value={`$${formatNumber(tokenDetails.marketCap ?? 0)}`} />
                         <DetailItem label={t('volume_24h')} value={`$${formatNumber(tokenDetails.volume24h ?? 0)}`} />
                    </InfoCard>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <InfoCard title={t('on_chain_security')} icon={<ShieldCheck />}>
                        <DetailItem label={t('is_mintable')}>
                            {tokenDetails.mintAuthority ? <XCircle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                        </DetailItem>
                         <DetailItem label={t('mint_authority')}>
                            {tokenDetails.mintAuthority ? <AddressDisplay address={tokenDetails.mintAuthority} /> : <span>{t('revoked')}</span>}
                        </DetailItem>
                         <DetailItem label={t('is_freezable')}>
                            {tokenDetails.freezeAuthority ? <XCircle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                        </DetailItem>
                        <DetailItem label={t('freeze_authority')}>
                            {tokenDetails.freezeAuthority ? <AddressDisplay address={tokenDetails.freezeAuthority} /> : <span>{t('revoked')}</span>}
                        </DetailItem>
                    </InfoCard>
                    <InfoCard title={t('token_distribution')} icon={<PieChart />}>
                         <DetailItem label={t('holders')} value={formatNumber(tokenDetails.holders ?? 0)} />
                         <DetailItem label={t('total_supply')} value={formatNumber(tokenDetails.totalSupply)} />
                    </InfoCard>
                </div>
            </div>
        </div>
    );
}