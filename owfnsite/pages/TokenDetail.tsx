import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import type { TokenDetails, TokenExtension, LiquidityPool } from '../lib/types.js';
import { 
    ArrowLeft, Loader2, AlertTriangle, Info, BarChart2, ShieldCheck, CheckCircle, XCircle, 
    Globe, Twitter, Send, Star, Share2, Layers, BookOpen, Key, Coins, Percent, EyeOff, 
    UserCheck, Ban, Zap, TrendingUp, TrendingDown, ExternalLink
} from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { formatNumber } from '../lib/utils.js';
import { DiscordIcon } from '../components/IconComponents.js';

// --- Sub-components for better organization ---

const InfoCard = ({ title, icon, children, gridCols = 1 }: { title: string, icon: React.ReactNode, children?: React.ReactNode, gridCols?: number }) => (
    <div className="bg-darkPrimary-800 p-6 rounded-2xl shadow-3d border border-darkPrimary-700/50">
        <div className="flex items-center gap-3 mb-4 text-darkPrimary-100">
            {icon}
            <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className={`space-y-3 grid grid-cols-1 md:grid-cols-${gridCols} gap-x-6`}>
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, value, children }: { label: string, value?: React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2.5 border-b border-darkPrimary-700/50 last:border-b-0">
        <span className="text-darkPrimary-400 mb-1 sm:mb-0 text-sm">{label}</span>
        <div className="font-semibold text-darkPrimary-100 text-left sm:text-right break-all w-full sm:w-auto text-sm">
            {value ?? children}
        </div>
    </div>
);

const AuthorityStatus = ({ label, address }: { label: string, address: string | null | undefined }) => {
    const { t } = useAppContext();
    const isRevoked = !address;
    return (
        <DetailItem label={label}>
            <div className="flex items-center gap-2">
                {isRevoked ? (
                    <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="font-bold text-green-400">{t('revoked')}</span>
                    </>
                ) : (
                    <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <AddressDisplay address={address!} />
                    </>
                )}
            </div>
        </DetailItem>
    );
};

const TokenExtensionDisplay = ({ extension }: { extension: TokenExtension }) => {
    const extensionIcons: { [key: string]: React.ReactNode } = {
        'transferFeeConfig': <Percent size={16} />,
        'interestBearingConfig': <Zap size={16} />,
        'permanentDelegate': <UserCheck size={16} />,
        'nonTransferable': <Ban size={16} />,
        'confidentialTransferMint': <EyeOff size={16} />,
        'defaultAccountState': <BookOpen size={16} />,
        'mintCloseAuthority': <Key size={16} />,
    };
    
    return (
        <div className="p-3 bg-darkPrimary-700/50 rounded-lg text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
                {extensionIcons[extension.extension] || <Layers size={16} />}
                <span>{extension.extension.replace(/([A-Z])/g, ' $1').trim()}</span>
            </div>
            <pre className="text-darkPrimary-400 whitespace-pre-wrap text-[10px] bg-darkPrimary-900/50 p-2 rounded">
                <code>{JSON.stringify(extension.state, null, 2)}</code>
            </pre>
        </div>
    );
};

const LiquidityPoolDisplay = ({ pool }: { pool: LiquidityPool }) => {
    return (
        <DetailItem label={pool.exchange}>
            <a href={pool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline text-darkAccent-400">
                <AddressDisplay address={pool.lpMintAddress} />
                <ExternalLink size={14} />
            </a>
        </DetailItem>
    );
};

// --- Main Component ---

export default function TokenDetail() {
    const { t, favorites, addFavorite, removeFavorite } = useAppContext();
    const [match, params] = useRoute<{ mint: string }>("/dashboard/token/:mint");
    const [location] = useLocation();
    const mintAddress = match && params ? params.mint : undefined;

    const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [shareCopied, setShareCopied] = useState(false);

    const fromPath = new URLSearchParams(location.split('?')[1] || '').get('from') || '/dashboard';
    const isFavorite = mintAddress ? favorites.includes(mintAddress) : false;

    const fetchTokenDetails = useCallback(async () => {
        if (!mintAddress) {
            setError('No mint address provided.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/token-info?mint=${mintAddress}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch token details.');
            }
            const data: TokenDetails = await response.json();
            setTokenDetails(data);
            setError('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            if(loading) setLoading(false);
        }
    }, [mintAddress, loading]);

    useEffect(() => {
        fetchTokenDetails(); // Initial fetch
        const interval = setInterval(fetchTokenDetails, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchTokenDetails]);
    
    const handleFavoriteToggle = useCallback(() => {
        if (!mintAddress) return;
        if (isFavorite) {
            removeFavorite(mintAddress);
        } else {
            addFavorite(mintAddress);
        }
    }, [mintAddress, isFavorite, addFavorite, removeFavorite]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
    };

    if (loading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="w-12 h-12 animate-spin text-darkAccent-500" /></div>;
    }

    if (error) {
        return (
            <div className="text-center py-10 bg-darkPrimary-800 rounded-lg">
                <AlertTriangle className="mx-auto w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-400">{t('token_not_found')}</h2>
                <p className="text-darkPrimary-400 mt-2">{error}</p>
                <Link to={fromPath} className="mt-6 inline-flex items-center gap-2 text-darkAccent-400 hover:underline">
                    <ArrowLeft size={16} /> {t(fromPath.includes('dashboard') ? 'back_to_dashboard' : 'back_to_profile')}
                </Link>
            </div>
        );
    }
    
    if (!tokenDetails) return null;
    
    const socialIcons: {[key: string]: React.ReactNode} = {
        'website': <Globe size={18}/>,
        'twitter': <Twitter size={18}/>,
        'telegram': <Send size={18}/>,
        'discord': <DiscordIcon className="w-[18px] h-[18px]"/>
    };
    
    const priceChange = tokenDetails.price24hChange ?? 0;
    const isPriceUp = priceChange >= 0;

    return (
        <div className="animate-fade-in-up space-y-6 text-darkPrimary-200">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-darkAccent-400 hover:underline mb-2">
                <ArrowLeft size={16} /> {t(fromPath.includes('dashboard') ? 'back_to_dashboard' : 'back_to_profile')}
            </Link>

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                {tokenDetails.logo && <img src={tokenDetails.logo as string} alt={tokenDetails.name} className="w-16 h-16 rounded-full border-2 border-darkPrimary-700" />}
                <div className="flex-grow">
                    <h1 className="text-4xl font-bold text-white">{tokenDetails.name}</h1>
                    <span className="text-lg font-mono text-darkPrimary-400">{tokenDetails.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                    {tokenDetails.links && Object.entries(tokenDetails.links).map(([key, value]) => 
                        socialIcons[key] && value && (
                            <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-darkPrimary-800 hover:bg-darkPrimary-700 rounded-full transition-colors border border-darkPrimary-700/50">
                                {socialIcons[key]}
                            </a>
                        )
                    )}
                    <button onClick={handleFavoriteToggle} className="p-2.5 bg-darkPrimary-800 hover:bg-darkPrimary-700 rounded-full transition-colors border border-darkPrimary-700/50">
                        <Star className={`transition-colors ${isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} size={18} />
                    </button>
                    <button onClick={handleShare} className="p-2.5 bg-darkPrimary-800 hover:bg-darkPrimary-700 rounded-full transition-colors border border-darkPrimary-700/50">
                       {shareCopied ? <CheckCircle size={18} className="text-green-400"/> : <Share2 size={18} />}
                    </button>
                </div>
            </div>
            
            <div className="bg-darkPrimary-800 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 border border-darkPrimary-700/50">
                <div className="flex-1 text-center md:text-left">
                    <p className="text-sm text-darkPrimary-400">{t('price_per_token')}</p>
                    <div className="flex items-center gap-3">
                        <p className="text-4xl font-bold text-white">${tokenDetails.pricePerToken > 0.0001 ? tokenDetails.pricePerToken.toLocaleString(undefined, { maximumFractionDigits: 6 }) : tokenDetails.pricePerToken.toPrecision(4)}</p>
                        <div className={`flex items-center gap-1 text-lg font-bold ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
                           {isPriceUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                           {priceChange.toFixed(2)}%
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <div className="h-24 bg-darkPrimary-700/50 rounded-lg flex items-center justify-center font-bold text-darkPrimary-500">{t('swap')} {t('coming_soon_title')}</div>
                </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-96 bg-darkPrimary-800 rounded-2xl flex items-center justify-center font-bold text-darkPrimary-500 border border-darkPrimary-700/50">Price Chart (TradingView) {t('coming_soon_title')}</div>
                    
                    {tokenDetails.description && (
                        <InfoCard title={t('token_description_title')} icon={<Info />}>
                            <p className="text-darkPrimary-300 text-sm leading-relaxed">{tokenDetails.description}</p>
                        </InfoCard>
                    )}
                     {tokenDetails.liquidityPools && tokenDetails.liquidityPools.length > 0 && (
                        <InfoCard title={t('liquidity')} icon={<Layers />}>
                            {tokenDetails.liquidityPools.map(pool => <LiquidityPoolDisplay key={pool.lpMintAddress} pool={pool} />)}
                        </InfoCard>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <InfoCard title={t('market_stats')} icon={<BarChart2 />}>
                         <DetailItem label={t('market_cap')} value={`$${formatNumber(tokenDetails.marketCap ?? 0)}`} />
                         <DetailItem label={t('volume_24h')} value={`$${formatNumber(tokenDetails.volume24h ?? 0)}`} />
                         <DetailItem label={t('total_supply')} value={formatNumber(tokenDetails.totalSupply)} />
                         <DetailItem label={t('circulating_supply')} value={formatNumber(tokenDetails.circulatingSupply ?? 0)} />
                         <DetailItem label={t('holders')} value={formatNumber(tokenDetails.holders ?? 0)} />
                    </InfoCard>

                    <InfoCard title={t('on_chain_security')} icon={<ShieldCheck />}>
                        <AuthorityStatus label={t('is_mintable')} address={tokenDetails.mintAuthority} />
                        <AuthorityStatus label={t('is_freezable')} address={tokenDetails.freezeAuthority} />
                        <AuthorityStatus label={t('update_authority')} address={tokenDetails.updateAuthority} />
                        <DetailItem label={t('creatorAddress', { defaultValue: 'Creator Address' })}>
                           {tokenDetails.creatorAddress ? <AddressDisplay address={tokenDetails.creatorAddress} /> : 'N/A'}
                        </DetailItem>
                    </InfoCard>

                    <InfoCard title={t('technical_details_title', { defaultValue: 'Technical Details' })} icon={<Coins />}>
                        <DetailItem label={t('token_standard')} value={tokenDetails.tokenStandard} />
                        <DetailItem label={t('token_decimals')} value={tokenDetails.decimals} />
                        <DetailItem label={t('creation_date_title', { defaultValue: 'Creation Date' })}>
                           {tokenDetails.createdAt ? new Date(tokenDetails.createdAt).toLocaleString() : 'N/A'}
                        </DetailItem>
                    </InfoCard>
                    
                    {tokenDetails.extensions && tokenDetails.extensions.length > 0 && (
                        <InfoCard title="Token-2022 Extensions" icon={<Zap />}>
                            <div className="space-y-2">
                                {tokenDetails.extensions.map(ext => <TokenExtensionDisplay key={ext.extension} extension={ext} />)}
                            </div>
                        </InfoCard>
                    )}
                </div>
            </div>
        </div>
    );
}