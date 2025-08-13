
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { Loader2, ArrowLeft, BarChart2, Briefcase, ShieldCheck, Info, Users, CheckCircle, XCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { HELIUS_RPC_URL, HELIUS_API_KEY } from '../constants.ts';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { translateText } from '../services/geminiService.ts';
import { Connection, PublicKey } from '@solana/web3.js';

// --- API Interfaces ---
interface HeliusAsset {
    id: string;
    content?: {
        metadata?: {
            name?: string;
            symbol?: string;
            description?: string;
        };
        links?: {
            image?: string;
        };
    };
    token_info?: {
        decimals: number;
        supply: string;
        token_program: string;
        mint_authority?: string;
        freeze_authority?: string;
    };
    authorities?: { address: string, type: string }[];
}

interface DexScreenerPair {
    pairAddress: string;
    dexId: string;
    priceUsd?: string;
    priceChange?: { h24?: number };
    volume?: { h24?: number };
    liquidity?: { usd?: number };
    fdv?: number;
    pairCreatedAt?: number;
    txns?: {
        h24: { buys: number, sells: number };
    };
}

interface BirdeyeTokenOverview {
    data?: {
        holders?: number;
        supply?: number;
        circulatingSupply?: number;
    };
}


const formatNumber = (num?: number, style: 'currency' | 'decimal' = 'decimal', maximumFractionDigits = 2) => {
    if (num === null || num === undefined) return 'N/A';
    const isCurrency = style === 'currency';
    const prefix = isCurrency ? '$' : '';

    if (Math.abs(num) >= 1_000_000_000) {
        return `${prefix}${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(num) >= 1_000_000) {
        return `${prefix}${(num / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(num) >= 1_000) {
        return `${prefix}${(num / 1_000).toFixed(2)}K`;
    }
    return isCurrency 
        ? num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits }) 
        : num.toLocaleString('en-US', { maximumFractionDigits });
};

const InfoItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-primary-200/50 dark:border-darkPrimary-700/50">
        <span className="text-primary-600 dark:text-darkPrimary-300 text-sm">{label}</span>
        <div className="text-right">
            <span className="font-semibold text-primary-800 dark:text-darkPrimary-100 text-sm font-mono">{value}</span>
        </div>
    </div>
);

const AuthorityStatus = ({ enabled, t, labelKey }: { enabled?: boolean, t: Function, labelKey: string }) => {
    const color = enabled ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    const Icon = enabled ? <XCircle size={14} /> : <CheckCircle size={14} />;
    const text = enabled ? t('yes') : t('no');

    return (
        <InfoItem 
            label={t(labelKey)} 
            value={
                <div className={`flex items-center justify-end gap-2 font-semibold ${color}`}>
                    {Icon}
                    <span>{text}</span>
                </div>
            } 
        />
    );
};

const InfoCard = ({ title, icon, children }: { title: string | React.ReactNode, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-lg h-full">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-accent-600 dark:text-darkAccent-400">
            {icon} {title}
        </h3>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

export default function TokenDetail() {
    const { t, currentLanguage } = useAppContext();
    const params = useParams();
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get('from');
    
    const mintAddress = params?.['mint'];

    const [token, setToken] = useState<TokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [displayedDescription, setDisplayedDescription] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

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
                const heliusPromise = fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 'my-id', method: 'getAsset', params: { id: mintAddress } }),
                });
                const dexscreenerPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
                const birdeyePromise = fetch(`https://public-api.birdeye.so/defi/token_overview?address=${mintAddress}`, {
                    headers: { 'X-API-KEY': '52536b330424422c88f21556a5751221' } // It's a public key from their docs
                });

                const [heliusResult, dexscreenerResult, birdeyeResult] = await Promise.allSettled([heliusPromise, dexscreenerPromise, birdeyePromise]);

                if (heliusResult.status === 'rejected' || (heliusResult.status === 'fulfilled' && !heliusResult.value.ok)) {
                     throw new Error(`Helius API failed`);
                }
                const heliusData = await heliusResult.value.json();
                const asset: HeliusAsset = heliusData.result;
                if (!asset) throw new Error("Could not fetch asset metadata from Helius.");

                let bestPair: DexScreenerPair | null = null;
                if (dexscreenerResult.status === 'fulfilled' && dexscreenerResult.value.ok) {
                    const dexscreenerData = await dexscreenerResult.value.json();
                    if (dexscreenerData.pairs && dexscreenerData.pairs.length > 0) {
                        bestPair = dexscreenerData.pairs
                            .filter((p: any) => p.liquidity && p.liquidity.usd > 1000)
                            .sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
                    }
                }
                
                let birdeyeData: BirdeyeTokenOverview = {};
                if (birdeyeResult.status === 'fulfilled' && birdeyeResult.value.ok) {
                    birdeyeData = await birdeyeResult.value.json();
                }

                const decimals = asset.token_info?.decimals ?? 0;
                let totalSupplyFromChain: bigint = 0n;

                if (asset.token_info?.supply) {
                    totalSupplyFromChain = BigInt(asset.token_info.supply);
                }
                
                if (totalSupplyFromChain === 0n) {
                    try {
                        const connection = new Connection(HELIUS_RPC_URL);
                        const supplyResponse = await connection.getTokenSupply(new PublicKey(mintAddress));
                        if (supplyResponse.value.amount) {
                            totalSupplyFromChain = BigInt(supplyResponse.value.amount);
                        }
                    } catch (e) {
                        console.error("Failed to get token supply from RPC", e);
                    }
                }
                const totalSupply = Number(totalSupplyFromChain) / Math.pow(10, decimals);
                
                let circulatingSupply = birdeyeData.data?.circulatingSupply ?? 0;
                if (circulatingSupply === 0 && totalSupply > 0) {
                    circulatingSupply = totalSupply;
                }

                const price = bestPair?.priceUsd ? parseFloat(bestPair.priceUsd) : 0;
                
                const formatAge = (timestamp?: number) => {
                    if (timestamp === null || timestamp === undefined) return 'N/A';
                    // Timestamps from dexscreener are in seconds. Let's do a sanity check.
                    // If it's a huge number, it might be in ms. A recent timestamp in ms is > 1.5e12
                    const date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
                    if (isNaN(date.getTime())) {
                        return 'N/A';
                    }
                    return new Intl.DateTimeFormat('en-CA').format(date);
                };
                
                const creator = asset.authorities?.find(a => a.type === 'creator');
                const updateAuthority = asset.authorities?.find(a => a.type === 'metadata_update_authority');

                const tokenData: TokenDetails = {
                    mintAddress: asset.id,
                    name: asset.content?.metadata?.name || 'Unknown Token',
                    symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}...`,
                    logo: <GenericTokenIcon uri={asset.content?.links?.image} className="w-12 h-12" />,
                    description: { en: asset.content?.metadata?.description || 'No description provided.' },
                    decimals: decimals,
                    totalSupply: totalSupply,
                    pricePerToken: price,
                    price24hChange: bestPair?.priceChange?.h24 ?? 0,
                    volume24h: bestPair?.volume?.h24 ?? 0,
                    liquidity: bestPair?.liquidity?.usd ?? 0,
                    marketCap: price * circulatingSupply,
                    fdv: bestPair?.fdv,
                    holders: birdeyeData.data?.holders ?? 0,
                    circulatingSupply: circulatingSupply,
                    pairAddress: bestPair?.pairAddress,
                    txns: bestPair?.txns,
                    totalTx24h: (bestPair?.txns?.h24.buys ?? 0) + (bestPair?.txns?.h24.sells ?? 0),
                    poolCreated: formatAge(bestPair?.pairCreatedAt),
                    dexId: bestPair?.dexId,
                    security: { 
                        isMutable: !!updateAuthority,
                        mintAuthorityRevoked: !asset.token_info?.mint_authority,
                        freezeAuthorityRevoked: !asset.token_info?.freeze_authority,
                    },
                    audit: {
                        contractVerified: null, // N/A, requires specialized API
                        isHoneypot: null, // N/A, requires specialized API
                        isFreezable: !!asset.token_info?.freeze_authority,
                        isMintable: !!asset.token_info?.mint_authority,
                        alerts: 0,
                    },
                    deployerAddress: creator?.address,
                    balance: 0, 
                    usdValue: 0,
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

    useEffect(() => {
        if (!token) return;

        const englishDescription = token.description.en;
        setDisplayedDescription(englishDescription); 
        
        const noDescriptionText = 'No description provided.';
        if (currentLanguage.code === 'en' || englishDescription === noDescriptionText) {
            setIsTranslating(false);
            return;
        }

        const doTranslate = async () => {
            setIsTranslating(true);
            try {
                const translatedText = await translateText(englishDescription, currentLanguage.name);
                setDisplayedDescription(translatedText);
            } catch (error) {
                console.error("Translation failed:", error);
                setDisplayedDescription(englishDescription);
            } finally {
                setIsTranslating(false);
            }
        };

        doTranslate();

    }, [token, currentLanguage]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
                <p className="text-primary-600 dark:text-darkPrimary-400">{t('profile_loading_tokens')}</p>
            </div>
        );
    }
    
    if (error || !token) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                 <Link to={from || '/dashboard'} className="text-accent-500 dark:text-darkAccent-500 hover:underline mt-4 inline-block flex items-center justify-center gap-2">
                    <ArrowLeft size={16} />
                    {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
                </Link>
            </div>
        );
    }

    const priceChangeColor = (token.price24hChange ?? 0) >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    
    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0">{token.logo}</div>
                    <div>
                        <h1 className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100 flex items-center gap-2">
                            {token.name} <span className="text-primary-500 dark:text-darkPrimary-400 text-lg">({token.symbol})</span>
                        </h1>
                    </div>
                </div>
                 <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary-900 dark:text-darkPrimary-100">
                            ${token.pricePerToken < 0.0001 ? token.pricePerToken.toPrecision(4) : token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </span>
                        <span className={`font-semibold ${priceChangeColor}`}>
                            {token.price24hChange?.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard title={t('market_stats')} icon={<BarChart2 size={20} />}>
                    <InfoItem label={t('market_cap')} value={formatNumber(token.marketCap, 'currency')} />
                    <InfoItem label={t('fully_diluted_valuation')} value={formatNumber(token.fdv, 'currency')} />
                    <InfoItem label={t('liquidity')} value={formatNumber(token.liquidity, 'currency')} />
                    <InfoItem label={t('volume_24h')} value={formatNumber(token.volume24h, 'currency')} />
                </InfoCard>

                <InfoCard title={t('token_distribution')} icon={<Users size={20} />}>
                     <InfoItem label={t('holders')} value={token.holders > 0 ? formatNumber(token.holders) : 'N/A'} />
                     <InfoItem label={t('circulating_supply')} value={formatNumber(token.circulatingSupply)} />
                     <InfoItem label={t('total_supply')} value={formatNumber(token.totalSupply)} />
                     <InfoItem label={t('total_transactions_24h')} value={token.totalTx24h?.toLocaleString() ?? 'N/A'} />
                </InfoCard>

                <InfoCard title={t('pool_info')} icon={<Briefcase size={20} />}>
                    <InfoItem label={t('exchange')} value={<span className="capitalize">{token.dexId ?? 'N/A'}</span>} />
                    {token.pairAddress && <InfoItem label={t('pair_address')} value={<AddressDisplay address={token.pairAddress} type="address" />} />}
                    <InfoItem label={t('pool_age')} value={token.poolCreated ?? 'N/A'} />
                    {token.deployerAddress && <InfoItem label={t('deployer_address')} value={<AddressDisplay address={token.deployerAddress} />} />}
                </InfoCard>

                <div className="lg:col-span-3">
                    <InfoCard title={t('on_chain_security')} icon={<ShieldCheck size={20} />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6">
                            <AuthorityStatus enabled={token.audit?.isMintable} t={t} labelKey="is_mintable" />
                            <AuthorityStatus enabled={token.audit?.isFreezable} t={t} labelKey="is_freezable" />
                            <InfoItem label={t('contract_verified')} value={
                                <span className="font-semibold text-primary-500 dark:text-darkPrimary-400">{t('check_not_available')}</span>
                            } />
                            <InfoItem label={t('is_honeypot')} value={
                                <span className="font-semibold text-primary-500 dark:text-darkPrimary-400">{t('check_not_available')}</span>
                            } />
                        </div>
                    </InfoCard>
                </div>

                 {token.description.en !== 'No description provided.' && (
                    <div className="lg:col-span-3">
                        <InfoCard 
                            title={
                                <div className="flex items-center gap-2">
                                    <span>{t('token_description_title')}</span>
                                    {isTranslating && <Loader2 className="w-4 h-4 animate-spin"/>}
                                </div>
                            } 
                            icon={<Info size={20} />}
                        >
                            <p className="text-sm text-primary-700 dark:text-darkPrimary-300 whitespace-pre-wrap">{displayedDescription}</p>
                        </InfoCard>
                    </div>
                 )}
            </div>

             <Link to={from || '/dashboard'} className="inline-flex items-center gap-2 text-sm text-accent-600 dark:text-darkAccent-400 hover:underline p-2 mt-2">
                <ArrowLeft size={16} /> {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
            </Link>
        </div>
    );
}
