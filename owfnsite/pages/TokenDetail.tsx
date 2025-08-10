import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { PublicKey } from '@solana/web3.js';
import { Star, Share2, Loader2, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { HELIUS_API_KEY, OWFN_MINT_ADDRESS, TOKEN_DETAILS } from '../constants.ts';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';

const TokenDetailHeader = ({ token }: { token: TokenDetails }) => {
    const pairSymbol = token.symbol === 'SOL' ? 'USDC' : 'SOL'; // Best guess for display
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex-shrink-0">{token.logo}</div>
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">{`${token.symbol} / ${pairSymbol}`}</h1>
                    <p className="text-sm text-primary-400">{token.name}</p>
                </div>
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
    );
};

const InfoItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-primary-700/50 last:border-b-0">
        <span className="text-primary-400">{label}</span>
        <span className="font-mono font-semibold text-primary-100">{value}</span>
    </div>
);


export default function TokenDetail() {
    const { t, currentLanguage, solana } = useAppContext();
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
            setToken(null);

            try {
                // --- Parallel Fetching ---
                const heliusPromise = fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id: 'my-id', method: 'getAsset', params: { id: mintAddress } }),
                }).then(res => {
                    if (!res.ok) throw new Error(`Helius API failed with status ${res.status}`);
                    return res.json();
                });

                const dexscreenerPromise = fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Dexscreener API failed with status ${res.status}`);
                        return res.json();
                    });

                const [heliusResponse, dexscreenerResponse] = await Promise.all([heliusPromise, dexscreenerPromise]);

                const asset = heliusResponse.result;
                if (!asset) throw new Error("Could not fetch asset metadata from Helius.");
                
                // --- Process Dexscreener Data to find the best trading pair ---
                let bestPair = null;
                if (dexscreenerResponse.pairs && dexscreenerResponse.pairs.length > 0) {
                    bestPair = dexscreenerResponse.pairs
                        .filter((p: any) => p.liquidity?.usd > 1000) // Filter for minimum liquidity
                        .sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
                }

                // --- Fetch On-chain Supply ---
                let circulatingSupply = 0;
                if (mintAddress !== 'So11111111111111111111111111111111111111112') { // Not SOL
                     try {
                        const supply = await solana.connection.getTokenSupply(new PublicKey(mintAddress));
                        circulatingSupply = supply.value.uiAmount || 0;
                     } catch (e) { console.error("Failed to fetch token supply", e); }
                }

                // --- Combine all live data ---
                const price = parseFloat(bestPair?.priceUsd || '0');
                const tokenData: TokenDetails = {
                    mintAddress: asset.id,
                    name: asset.content?.metadata?.name || 'Unknown Token',
                    symbol: asset.content?.metadata?.symbol || `${asset.id.slice(0, 4)}...`,
                    logo: <GenericTokenIcon uri={asset.content?.links?.image} className="w-12 h-12" />,
                    description: { en: asset.content?.metadata?.description || '' },
                    decimals: asset.token_info?.decimals || 0,
                    pricePerToken: price,
                    price24hChange: bestPair?.priceChange?.h24 || 0,
                    volume24h: bestPair?.volume?.h24 || 0,
                    liquidity: bestPair?.liquidity?.usd || 0,
                    pairAddress: bestPair?.pairAddress || '',
                    poolCreated: bestPair ? new Date(bestPair.pairCreatedAt).toLocaleDateString() : 'N/A',
                    circulatingSupply: circulatingSupply,
                    marketCap: circulatingSupply * price,
                    totalSupply: asset.id === OWFN_MINT_ADDRESS ? TOKEN_DETAILS.totalSupply : circulatingSupply,
                    security: { isMutable: false, mintAuthorityRevoked: true, freezeAuthorityRevoked: true },
                    holders: 0,
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
    }, [mintAddress, solana.connection]);

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
    const chartUrl = token.pairAddress ? `https://dexscreener.com/solana/${token.pairAddress}?embed=1&theme=dark&info=0&trades=0` : '';
    const priceChangeColor = token.price24hChange >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="animate-fade-in-up space-y-4">
            <TokenDetailHeader token={token} />
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 bg-primary-800 rounded-lg shadow-lg flex flex-col min-h-[500px]">
                    <div className="p-4 flex items-baseline justify-between border-b border-primary-700">
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-primary-100">
                                ${token.pricePerToken < 0.001 ? token.pricePerToken.toPrecision(4) : token.pricePerToken.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                            </span>
                            <span className={`font-semibold ${priceChangeColor}`}>
                                {token.price24hChange.toFixed(2)}% (24h)
                            </span>
                        </div>
                    </div>
                    <div className="flex-grow">
                        {chartUrl ? (
                            <iframe
                                src={chartUrl}
                                className="w-full h-full rounded-b-lg"
                                frameBorder="0"
                                allowFullScreen
                                title={`${token.symbol} Chart`}
                            />
                        ) : (
                            <div className="flex-grow flex items-center justify-center p-4 text-center">
                                <p className="text-primary-500">A live chart could not be loaded for this token as it does not appear to have an active trading pair on a decentralized exchange.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-primary-800 rounded-lg shadow-lg p-4 space-y-3 self-start">
                    <h3 className="text-lg font-bold">Live Market Data</h3>
                    <div className="space-y-1">
                        <InfoItem label="Market Cap" value={token.marketCap > 1 ? `$${(token.marketCap / 1_000_000).toFixed(2)}M` : 'N/A'} />
                        <InfoItem label="24h Volume" value={token.volume24h > 1 ? `$${token.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'} />
                        <InfoItem label="Liquidity" value={token.liquidity > 1 ? `$${token.liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : 'N/A'} />
                        <InfoItem label="Circulating Supply" value={token.circulatingSupply > 0 ? `${(token.circulatingSupply / 1_000_000_000).toFixed(2)}B` : 'N/A'} />
                        <InfoItem label="Total Supply" value={token.totalSupply > 0 ? `${(token.totalSupply / 1_000_000_000).toFixed(2)}B` : 'N/A'} />
                        <InfoItem label="Pool Created" value={token.poolCreated} />
                        <div className="pt-2">
                             <AddressDisplay address={token.pairAddress} />
                        </div>
                    </div>
                </div>
            </div>

            {description && (
                <div className="bg-primary-800 rounded-lg shadow-lg p-4">
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