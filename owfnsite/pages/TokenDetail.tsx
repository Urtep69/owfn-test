import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Star, Share2, Loader2, ArrowLeft, Briefcase, TrendingUp, Droplets, Info } from 'lucide-react';
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
    };
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

const TokenDetailHeader = ({ token }: { token: TokenDetails }) => {
    const priceChangeColor = (token.price24hChange ?? 0) >= 0 ? 'text-green-400' : 'text-red-400';
    
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0">{token.logo}</div>
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">{token.name} ({token.symbol})</h1>
                    <AddressDisplay address={token.mintAddress} type="token" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary-100">
                        ${token.pricePerToken < 0.001 ? token.pricePerToken.toPrecision(4) : token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </span>
                    <span className={`font-semibold ${priceChangeColor}`}>
                        {token.price24hChange?.toFixed(2)}% (24h)
                    </span>
                </div>
                <div className="flex items-center gap-2 text-primary-400">
                    <button className="p-2 rounded-lg hover:bg-primary-700 hover:text-yellow-400 transition-colors" aria-label="Add to favorites">
                        <Star size={20} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-primary-700 hover:text-primary-100 transition-colors" aria-label="Share">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, subtext }: { label: string, value: React.ReactNode, subtext?: string }) => {
    if (value === null || value === undefined || value === 'N/A' || value === '$0.00' || value === '$0') return null;
    return (
        <div className="bg-primary-900/50 p-3 rounded-lg">
            <div className="text-xs text-primary-400 mb-1">{label}</div>
            <div className="font-mono font-semibold text-primary-100 text-lg">{value}</div>
            {subtext && <div className="text-xs text-primary-500 mt-1">{subtext}</div>}
        </div>
    );
};

const NoMarketDataDisplay = ({ token }: { token: TokenDetails }) => {
    const { t } = useAppContext();
    const formatSupply = (num?: number) => {
        if (!num) return 'N/A';
        if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
        return num.toFixed(2);
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-primary-400 bg-primary-900/50 rounded-lg p-6 min-h-[500px]">
            <Briefcase className="w-16 h-16 text-primary-600 mb-4" />
            <h3 className="text-xl font-bold text-primary-200">Token Information</h3>
            <p className="max-w-xs mt-2 text-sm mb-6">
                Live market data for this token is not yet available. This usually means the token has not been listed on a decentralized exchange.
            </p>
            <div className="w-full max-w-sm bg-primary-800 p-4 rounded-lg">
                 <div className="flex justify-between items-center py-2 border-b border-primary-700/50">
                     <span className="text-primary-400 text-sm">{t('token_symbol_label')}</span>
                     <span className="font-semibold">{token.symbol}</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-primary-400 text-sm">{t('total_supply')}</span>
                    <span className="font-semibold">{formatSupply(token.totalSupply)}</span>
                </div>
            </div>
        </div>
    );
};


export default function TokenDetail() {
    const { t, currentLanguage } = useAppContext();
    const params = useParams();
    const [location] = useLocation();
    const searchParams = new URLSearchParams(location.split('?')[1] || '');
    const from = searchParams.get('from');
    
    const mintAddress = params?.['mint'];

    const [token, setToken] = useState<TokenDetails | null>(null);
    const [bestPairAddress, setBestPairAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatNumber = (num?: number, style: 'currency' | 'decimal' = 'decimal', maximumFractionDigits = 0) => {
        if (num === null || num === undefined) return 'N/A';
        const isCurrency = style === 'currency';

        if (Math.abs(num) >= 1_000_000_000) {
            return `${isCurrency ? '$' : ''}${(num / 1_000_000_000).toFixed(2)}B`;
        }
        if (Math.abs(num) >= 1_000_000) {
            return `${isCurrency ? '$' : ''}${(num / 1_000_000).toFixed(2)}M`;
        }
        if (Math.abs(num) >= 1_000) {
            return `${isCurrency ? '$' : ''}${(num / 1_000).toFixed(2)}K`;
        }
        return isCurrency 
            ? num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits }) 
            : num.toLocaleString('en-US', { maximumFractionDigits });
    };

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
                    const pairs: DexScreenerPair[] = dexscreenerData.pairs;
                    if (pairs && pairs.length > 0) {
                        bestPair = pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
                        setBestPairAddress(bestPair.pairAddress);
                    }
                }

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
                    security: { isMutable: false, mintAuthorityRevoked: true, freezeAuthorityRevoked: true },
                    holders: 0,
                    balance: 0,
                    usdValue: 0,
                    circulatingSupply: 0,
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
            <div className="flex flex-col justify-center items-center h-96 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
                <p className="text-primary-400">Loading live token data...</p>
            </div>
        );
    }
    
    if (error || !token) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                <Link to={from || '/dashboard'} className="text-accent-500 hover:underline mt-4 inline-block">
                    <div className="flex items-center gap-2">
                         <ArrowLeft size={16} />
                         {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
                    </div>
                </Link>
            </div>
        );
    }
    
    const description = token.description[currentLanguage.code] || token.description['en'];

    return (
        <div className="animate-fade-in-up space-y-6">
            <TokenDetailHeader token={token} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-primary-800 rounded-lg shadow-lg p-4 space-y-3 self-start">
                    <h3 className="text-xl font-bold text-primary-100 px-2">{t('token_info')}</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <InfoItem label={t('market_cap')} value={formatNumber(token.marketCap, 'currency')} />
                        <InfoItem label={t('liquidity')} value={formatNumber(token.liquidity, 'currency')} />
                        <InfoItem label={t('volume_24h')} value={formatNumber(token.volume24h, 'currency')} />
                        <InfoItem label={t('total_supply')} value={formatNumber(token.totalSupply, 'decimal')} />
                    </div>
                    {token.txns && (
                        <InfoItem 
                            label={t('buys_sells_24h')} 
                            value={<><span className="text-green-400">{token.txns.h24.buys}</span> / <span className="text-red-400">{token.txns.h24.sells}</span></>} 
                        />
                    )}
                    {token.pairCreatedAt && (
                         <InfoItem 
                            label={t('pool_created')} 
                            value={new Date(token.pairCreatedAt).toLocaleDateString()} 
                        />
                    )}
                    {token.pairAddress && (
                        <div className="bg-primary-900/50 p-3 rounded-lg">
                            <div className="text-xs text-primary-400 mb-1">{t('pair_address')}</div>
                            <AddressDisplay address={token.pairAddress} />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 bg-primary-800 rounded-lg shadow-lg flex flex-col min-h-[700px]">
                    {bestPairAddress ? (
                        <div className="flex-grow rounded-lg overflow-hidden">
                           <iframe
                                src={`https://www.dextools.io/widget/en/solana/pair-explorer/${bestPairAddress}?theme=dark&chartType=2&chartResolution=15&info=true&trades=true`}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                                title="DEXTools Live Chart"
                            />
                        </div>
                    ) : (
                        <NoMarketDataDisplay token={token} />
                    )}
                </div>
            </div>

            {description && (
                <div className="bg-primary-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-bold mb-2">{t('token_description_title')}</h3>
                    <p className="text-sm text-primary-400 whitespace-pre-wrap">{description}</p>
                </div>
            )}
            
            <Link to={from || '/dashboard'} className="inline-flex items-center gap-2 text-sm text-accent-400 hover:underline p-2 mt-2">
                <ArrowLeft size={16} /> {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
            </Link>
        </div>
    );
}
