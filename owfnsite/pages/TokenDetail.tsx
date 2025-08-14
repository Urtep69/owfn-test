import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Loader2, ArrowLeft, BarChart2, Droplets, Users, Database, Calendar, User, Shield, Key, Code, Percent, Zap, FileText, Link as LinkIcon, Hand, UserCog, Ban, Star } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails, TokenExtension } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { SolIcon } from '../components/IconComponents.tsx';

// --- HELPER FUNCTIONS ---

const formatNumber = (num?: number | null, options: Intl.NumberFormatOptions = {}) => {
    if (num === null || num === undefined) return 'N/A';
    const defaultOptions: Intl.NumberFormatOptions = {
        maximumFractionDigits: 2,
        ...options,
    };
    return new Intl.NumberFormat('en-US', defaultOptions).format(num);
};

const formatBigNumber = (num?: number | null) => {
    if (num === null || num === undefined) return 'N/A';
    if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (Math.abs(num) >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// --- UI COMPONENTS ---

const PriceChart = ({ pairAddress, theme }: { pairAddress?: string, theme: string }) => {
    if (!pairAddress) return <div className="aspect-video bg-primary-100 dark:bg-darkPrimary-800 rounded-lg flex items-center justify-center text-primary-500">Price chart unavailable</div>;
    const src = `https://dexscreener.com/solana/${pairAddress}?embed=1&theme=${theme}&info=0`;
    return (
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-primary-200 dark:border-darkPrimary-700">
            <iframe
                src={src}
                width="100%"
                height="100%"
                allowFullScreen
                className="border-0"
            />
        </div>
    );
};

const DetailCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-900 p-6 rounded-xl shadow-lg">
        <div className="flex items-center text-primary-700 dark:text-darkPrimary-300 mb-4">
            {icon}
            <h3 className="text-lg font-bold ml-3">{title}</h3>
        </div>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex justify-between items-center text-sm border-b border-primary-100 dark:border-darkPrimary-800 pb-2">
        <span className="text-primary-500 dark:text-darkPrimary-400">{label}</span>
        <div className="font-semibold text-primary-800 dark:text-darkPrimary-200 text-right">{children}</div>
    </div>
);

const AuthorityRow = ({ label, address }: { label: string, address?: string | null }) => (
    <InfoRow label={label}>
        {address ? (
            <AddressDisplay address={address} />
        ) : (
            <span className="text-green-500 dark:text-green-400 font-bold flex items-center gap-1.5">
                <Shield size={14} /> Revoked
            </span>
        )}
    </InfoRow>
);

const ExtensionDisplay = ({ extension }: { extension: TokenExtension }) => {
    const {t} = useAppContext();
    const { extension: name, state } = extension;
    let content = null;
    switch (name) {
        case 'transferFeeConfig':
            const fee = (state.newerTransferFee?.transferFeeBasisPoints ?? state.olderTransferFee?.transferFeeBasisPoints ?? 0) / 100;
            const maxFee = Number(state.newerTransferFee?.maximumFee ?? state.olderTransferFee?.maximumFee ?? 0) / (10 ** state.mintDecimals);
            content = <><Percent size={14} /> Transfer Fee: {fee.toFixed(2)}% (Max: {maxFee.toLocaleString()})</>;
            break;
        case 'interestBearingConfig':
            const rate = state.rate / 100; // Assuming basis points
            content = <><Zap size={14} /> Interest Bearing: {rate.toFixed(2)}% APR</>;
            break;
        case 'defaultAccountState':
            content = <><Hand size={14} /> Default State: {state.state}</>;
            break;
        case 'permanentDelegate':
             content = <><UserCog size={14} /> Permanent Delegate</>;
             break;
        case 'nonTransferable':
            content = <><Ban size={14} /> Non-Transferable</>;
            break;
        default:
            content = <><Star size={14} /> {name}</>;
    }
    return <div className="text-xs bg-primary-100 dark:bg-darkPrimary-800 p-2 rounded-md flex items-center gap-2">{content}</div>;
};

const StatGridCard = ({ label, value, subValue, icon }: { label: string, value: React.ReactNode, subValue?: React.ReactNode, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-900 p-4 rounded-xl shadow-lg">
        <div className="flex items-center text-primary-500 dark:text-darkPrimary-400 mb-2">
            {icon}
            <span className="text-sm font-semibold ml-2">{label}</span>
        </div>
        <p className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100 truncate">{value}</p>
        {subValue && <p className="text-xs text-primary-500 dark:text-darkPrimary-500 mt-1">{subValue}</p>}
    </div>
);

export default function TokenDetail() {
    const { t, theme } = useAppContext();
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
                    const errorBody = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
                    throw new Error(errorBody.error || "Failed to fetch token data.");
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
        const interval = setInterval(fetchTokenData, 60000); // Refresh every 60 seconds
        return () => clearInterval(interval);
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
                <Link to="/dashboard" className="text-accent-500 hover:underline mt-4 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> {t('back_to_dashboard')}
                </Link>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 text-primary-900 dark:text-darkPrimary-100 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <GenericTokenIcon uri={token.logo as string} className="w-16 h-16 flex-shrink-0" />
                <div className="flex-grow">
                    <h1 className="text-3xl font-bold">{token.name}</h1>
                    <p className="text-primary-500 dark:text-darkPrimary-400 font-semibold text-lg">{token.symbol}</p>
                </div>
                 <a
                    href={`https://jup.ag/swap/SOL-${token.mintAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto text-center bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg text-lg hover:opacity-90 transition-opacity"
                >
                    {t('swap')}
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <PriceChart pairAddress={token.pairAddress} theme={theme} />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <StatGridCard label={t('market_cap')} value={`$${formatBigNumber(token.marketCap)}`} icon={<BarChart2 size={20}/>} />
                        <StatGridCard label={t('volume_24h')} value={`$${formatBigNumber(token.volume24h)}`} icon={<Droplets size={20}/>} />
                        <StatGridCard label={t('holders')} value={token.holders?.toLocaleString() ?? 'N/A'} icon={<Users size={20}/>} />
                        <StatGridCard label={t('liquidity')} value={`$${formatBigNumber(token.liquidity)}`} icon={<Droplets size={20}/>} />
                        <StatGridCard label={t('circulating_supply')} value={formatBigNumber(token.circulatingSupply)} icon={<Database size={20}/>} />
                        <StatGridCard label={t('total_supply')} value={formatBigNumber(token.totalSupply)} icon={<Database size={20}/>} />
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <DetailCard title={t('token_detail_title')} icon={<FileText size={20}/>}>
                        <InfoRow label={t('presale_token_address_label')}><AddressDisplay address={token.mintAddress} type="token"/></InfoRow>
                        <InfoRow label="Creator"><AddressDisplay address={token.creatorAddress ?? 'Unknown'} /></InfoRow>
                        <InfoRow label="Pool Created">{token.poolCreatedAt ? new Date(token.poolCreatedAt).toLocaleDateString() : 'N/A'}</InfoRow>
                        <InfoRow label={t('token_decimals')}>{token.decimals}</InfoRow>
                    </DetailCard>

                    <DetailCard title="Authorities" icon={<Shield size={20} />}>
                        <AuthorityRow label="Update Authority" address={token.updateAuthority} />
                        <AuthorityRow label="Mint Authority" address={token.mintAuthority} />
                        <AuthorityRow label="Freeze Authority" address={token.freezeAuthority} />
                    </DetailCard>

                    <DetailCard title="Token Standard" icon={<Code size={20} />}>
                        <div className="bg-primary-100 dark:bg-darkPrimary-800 p-2 rounded-md font-mono text-center font-bold">{token.tokenStandard}</div>
                        {token.tokenStandard === 'Token-2022' && token.tokenExtensions && token.tokenExtensions.length > 0 && (
                             <div className="mt-4 pt-4 border-t border-primary-100 dark:border-darkPrimary-800 space-y-2">
                                <h4 className="font-bold text-sm">Active Extensions:</h4>
                                {token.tokenExtensions.map((ext, i) => <ExtensionDisplay key={i} extension={ext} />)}
                             </div>
                        )}
                    </DetailCard>
                    
                    {token.dexId && token.pairAddress && (
                        <DetailCard title="Liquidity Pool" icon={<LinkIcon size={20} />}>
                            <InfoRow label="Exchange">
                                <span className="capitalize">{token.dexId}</span>
                            </InfoRow>
                            <InfoRow label="Pair Address">
                                <AddressDisplay address={token.pairAddress} />
                            </InfoRow>
                        </DetailCard>
                    )}
                </div>
            </div>
        </div>
    );
}