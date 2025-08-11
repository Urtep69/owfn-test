import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Star, Share2, Loader2, ArrowLeft, BarChart2, DollarSign, Users, Flame, UserCog, KeyRound, Lock, Unlock, TrendingUp, Briefcase } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { HELIUS_API_KEY } from '../constants.ts';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';

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

const AuthorityStatus = ({ enabled, t, labelKey }: { enabled?: boolean, t: Function, labelKey: string }) => {
    const color = enabled ? 'text-red-400' : 'text-green-400';
    const Icon = enabled ? Unlock : Lock;
    return (
         <div className="flex justify-between items-center py-2 border-b border-primary-700/50">
            <span className="text-primary-400 text-sm">{t(labelKey)}</span>
            <div className={`flex items-center gap-2 font-semibold ${color}`}>
                <Icon size={14} />
                <span>{enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
        </div>
    );
};

export default function TokenDetail() {
    const { t } = useAppContext();
    const params = useParams();
    const [location] = useLocation();
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const from = searchParams.get('from');
    
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
                const heliusPromise = fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 'my-id', method: 'getAsset', params: { id: mintAddress } }),
                });

                const dexscreenerPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
                
                const [heliusRes, dexscreenerRes] = await Promise.all([heliusPromise, dexscreenerPromise]);

                if (!heliusRes.ok) throw new Error(`Helius API failed with status ${heliusRes.status}`);
                const heliusData = await heliusRes.json();
                const asset: HeliusAsset = heliusData.result;
                if (!asset) throw new Error("Could not fetch asset metadata from Helius.");

                let bestPair: DexScreenerPair | null = null;
                if (dexscreenerRes.ok) {
                    const dexscreenerData = await dexscreenerRes.json();
                    if (dexscreenerData.pairs && dexscreenerData.pairs.length > 0) {
                        bestPair = dexscreenerData.pairs.sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
                    }
                }

                const deployer = asset.authorities?.find(a => a.type === 'metadata_update_authority');

                const tokenData: TokenDetails = {
                    mintAddress: asset.id,
                    name: asset.content?.metadata?.name || 'Unknown Token',
                    symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}...`,
                    logo: <GenericTokenIcon uri={asset.content?.links?.image} className="w-12 h-12" />,
                    description: { en: asset.content?.metadata?.description || '' },
                    decimals: asset.token_info?.decimals || 0,
                    totalSupply: asset.token_info ? parseFloat(asset.token_info.supply) / Math.pow(10, asset.token_info.decimals || 0) : 0,
                    pricePerToken: bestPair?.priceUsd ? parseFloat(bestPair.priceUsd) : 0,
                    price24hChange: bestPair?.priceChange?.h24 ?? 0,
                    volume24h: bestPair?.volume?.h24 ?? 0,
                    liquidity: bestPair?.liquidity?.usd ?? 0,
                    marketCap: bestPair?.fdv ?? 0,
                    fdv: bestPair?.fdv,
                    pairAddress: bestPair?.pairAddress,
                    pairCreatedAt: bestPair?.pairCreatedAt,
                    txns: bestPair?.txns,
                    security: { 
                        isMutable: !!deployer,
                        mintAuthorityRevoked: !asset.token_info?.mint_authority,
                        freezeAuthorityRevoked: !asset.token_info?.freeze_authority,
                    },
                    holders: 0,
                    balance: 0,
                    usdValue: 0,
                    circulatingSupply: 0,
                    lpBurnedPercent: 0, // Mock data
                    deployerAddress: deployer?.address ?? 't227c...4DR4', // Mock fallback
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
    
    const chartData = useMemo(() => {
        if (!token || token.pricePerToken === 0) return [];
        // Create a simple mock trend based on 24h change
        const basePrice = token.pricePerToken / (1 + (token.price24hChange ?? 0) / 100);
        const data = Array.from({ length: 8 }, (_, i) => {
            const pricePoint = basePrice * (1 + ((token.price24hChange ?? 0) / 100) * (i/7) + (Math.random() - 0.5) * 0.05);
            return {
                name: i === 7 ? 'Now' : `${7-i}d ago`,
                price: Math.max(0, pricePoint) // Ensure price isn't negative
            };
        });
        return data;
    }, [token]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
                <p className="text-primary-400">{t('profile_loading_tokens')}</p>
            </div>
        );
    }
    
    if (error || !token) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                 <Link to={from || '/dashboard'} className="text-accent-500 hover:underline mt-4 inline-block flex items-center justify-center gap-2">
                    <ArrowLeft size={16} />
                    {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
                </Link>
            </div>
        );
    }

    const priceChangeColor = (token.price24hChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400';
    
    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0">{token.logo}</div>
                    <div>
                        <h1 className="text-2xl font-bold text-primary-100 flex items-center gap-2">
                            {token.name} <span className="text-primary-400 text-lg">({token.symbol})</span>
                        </h1>
                    </div>
                </div>
                 <div className="flex items-center gap-4 self-end">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-primary-100">
                            ${token.pricePerToken < 0.0001 ? token.pricePerToken.toPrecision(4) : token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </span>
                        <span className={`font-semibold ${priceChangeColor}`}>
                            {token.price24hChange?.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-primary-800 rounded-lg shadow-lg h-[500px] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#44403c" />
                                <XAxis dataKey="name" stroke="#a8a29e" />
                                <YAxis 
                                    stroke="#a8a29e" 
                                    domain={['auto', 'auto']} 
                                    tickFormatter={(value) => `$${Number(value).toPrecision(4)}`} 
                                    width={80}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #44403c', borderRadius: '0.5rem' }} 
                                    labelStyle={{ color: '#f5f5f4' }}
                                    itemStyle={{ color: '#d2b48c' }}
                                    formatter={(value: number) => [`$${value.toPrecision(6)}`, 'Price']}
                                />
                                <Line type="monotone" dataKey="price" stroke="#d2b48c" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-primary-800 p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><BarChart2 size={20} /> {t('trading_stats')}</h3>
                        <div className="space-y-3 text-sm">
                             <div className="flex justify-between items-center p-2 bg-primary-900/50 rounded-md">
                                <span className="text-primary-400">{t('buys')} (24h)</span>
                                <span className="font-mono text-green-400">{token.txns?.h24.buys.toLocaleString() ?? 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-primary-900/50 rounded-md">
                                <span className="text-primary-400">{t('sells')} (24h)</span>
                                <span className="font-mono text-red-400">{token.txns?.h24.sells.toLocaleString() ?? 'N/A'}</span>
                            </div>
                             <div className="flex justify-between items-center p-2 bg-primary-900/50 rounded-md">
                                <span className="text-primary-400">{t('volume_24h')}</span>
                                <span className="font-mono text-primary-100">{formatNumber(token.volume24h, 'currency')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-primary-800 p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><DollarSign size={20} /> {t('market_cap')}</h3>
                         <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center p-2 bg-primary-900/50 rounded-md">
                                <span className="text-primary-400">{t('market_cap')}</span>
                                <span className="font-mono text-primary-100">{formatNumber(token.marketCap, 'currency')}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-primary-900/50 rounded-md">
                                <span className="text-primary-400">{t('liquidity')}</span>
                                <span className="font-mono text-primary-100">{formatNumber(token.liquidity, 'currency')}</span>
                            </div>
                             <div className="flex justify-between items-center p-2 bg-primary-900/50 rounded-md">
                                <span className="text-primary-400">{t('total_supply')}</span>
                                <span className="font-mono text-primary-100">{formatNumber(token.totalSupply)}</span>
                            </div>
                        </div>
                    </div>
                     <div className="bg-primary-800 p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><KeyRound size={20} /> {t('token_info')}</h3>
                         <div className="text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-primary-700/50">
                                <span className="text-primary-400">{t('lp_burned')}</span>
                                <div className="flex items-center gap-2 font-semibold">
                                    <Flame size={14} />
                                    <span>{token.lpBurnedPercent?.toFixed(2)}%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-primary-700/50">
                                <span className="text-primary-400">{t('deployer')}</span>
                                <AddressDisplay address={token.deployerAddress!} />
                            </div>
                            <AuthorityStatus enabled={!token.security.mintAuthorityRevoked} t={t} labelKey="mint_authority" />
                            <AuthorityStatus enabled={!token.security.freezeAuthorityRevoked} t={t} labelKey="freeze_authority" />
                        </div>
                    </div>
                </div>
            </div>
             <Link to={from || '/dashboard'} className="inline-flex items-center gap-2 text-sm text-accent-400 hover:underline p-2 mt-2">
                <ArrowLeft size={16} /> {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
            </Link>
        </div>
    );
}
