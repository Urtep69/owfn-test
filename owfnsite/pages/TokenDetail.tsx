import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { PublicKey } from '@solana/web3.js';
import { 
    Star, Share2, Search, Settings2, Shield, Loader2
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { MOCK_TOKEN_DETAILS, TOKEN_DETAILS, HELIUS_API_KEY } from '../constants.ts';
import type { TokenDetails } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';

// --- Sub-components defined within the page for locality ---
const TokenDetailHeader = ({ token }: { token: TokenDetails }) => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-2 bg-primary-800 rounded-md">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0">{token.logo}</div>
            <div>
                <h1 className="text-xl font-bold text-primary-100">{token.symbol === 'SOL' ? 'SOL' : `${token.symbol} / SOL`}</h1>
                <p className="text-sm text-primary-400">{token.name}</p>
            </div>
            <div className="flex items-center gap-2 text-primary-400">
                <button className="hover:text-yellow-400 transition-colors"><Star size={20} /></button>
                <button className="hover:text-primary-100 transition-colors"><Share2 size={20} /></button>
            </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input 
                    type="text" 
                    placeholder="Search..."
                    className="bg-primary-700 border border-primary-600 rounded-md py-1.5 pl-9 pr-3 w-full focus:ring-accent-500 focus:border-accent-500"
                />
            </div>
            {token.audit && <button className="bg-accent-500 text-primary-950 text-xs font-bold px-3 py-1.5 rounded-md hover:bg-accent-400 flex items-center gap-1">
                <Shield size={14} /> AUDIT
            </button>}
            <button className="p-1.5 text-primary-400 hover:text-primary-100 transition-colors"><Settings2 size={20} /></button>
        </div>
    </div>
);

const InfoItem = ({ label, value, valueClassName = '' }: { label: string, value: React.ReactNode, valueClassName?: string }) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-primary-400">{label}</span>
        <span className={`font-mono font-semibold text-primary-100 ${valueClassName}`}>{value}</span>
    </div>
);

const TokenInfoPanel = ({ token, price }: { token: TokenDetails, price: number }) => {
    const { solana } = useAppContext();
    const [circulatingSupply, setCirculatingSupply] = useState(0);
    
    useEffect(() => {
        const fetchSupply = async () => {
            if (token.mintAddress && token.symbol !== 'SOL') {
                 try {
                    const supply = await solana.connection.getTokenSupply(new PublicKey(token.mintAddress));
                    setCirculatingSupply(supply.value.uiAmount || 0);
                 } catch (e) {
                     console.error("Failed to fetch token supply", e);
                 }
            }
        };
        fetchSupply();
    }, [token.mintAddress, solana.connection]);

    const marketCap = price * circulatingSupply;
    const totalSupply = token.symbol === 'OWFN' ? TOKEN_DETAILS.totalSupply : circulatingSupply;

    return (
        <div className="bg-primary-800 rounded-md p-3 space-y-3">
             <div className="grid grid-cols-2 gap-3">
                {marketCap > 0 && <InfoItem label="Market Cap" value={`$${(marketCap / 1_000_000).toFixed(2)}M`} />}
                {circulatingSupply > 0 && <InfoItem label="Circ. Supply" value={`${(circulatingSupply / 1_000_000_000).toFixed(2)}B`} />}
                {totalSupply > 0 && <InfoItem label="Total Supply" value={`${(totalSupply / 1_000_000_000).toFixed(2)}B`} />}
                {token.poolCreated && token.poolCreated !== 'N/A' && <InfoItem label="Pool Created" value={token.poolCreated} />}
            </div>
            {token.pairAddress && 
             <div className="border-t border-primary-700 pt-2">
                <AddressDisplay address={token.pairAddress} />
             </div>
            }
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
    const [loading, setLoading] = useState(true);
    const [chartUrl, setChartUrl] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (!mintAddress) {
            setLoading(false);
            return;
        }

        const fetchTokenData = async () => {
            setLoading(true);
            try {
                // 1. Fetch metadata from Helius
                const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 'my-id',
                        method: 'getAsset',
                        params: { id: mintAddress },
                    }),
                });
                if (!response.ok) throw new Error('Failed to fetch asset from Helius');
                const { result: asset } = await response.json();

                // 2. Fetch price from Jupiter
                const priceRes = await fetch(`https://price.jup.ag/v4/price?ids=${mintAddress}`);
                const priceData = await priceRes.json();
                const currentPrice = priceData.data?.[mintAddress]?.price || 0;
                setPrice(currentPrice);

                // 3. Fetch pair info from Dexscreener
                const dexscreenerRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`);
                let pairAddress = '';
                if (dexscreenerRes.ok) {
                    const dexscreenerData = await dexscreenerRes.json();
                    if (dexscreenerData.pairs && dexscreenerData.pairs.length > 0) {
                        const sortedPairs = dexscreenerData.pairs
                            .filter((p: any) => p.quoteToken.symbol === 'SOL' || p.quoteToken.symbol === 'USDC')
                            .sort((a: any, b: any) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
                        pairAddress = sortedPairs.length > 0 ? sortedPairs[0].pairAddress : dexscreenerData.pairs[0].pairAddress;
                    }
                }
                
                if (pairAddress) {
                    setChartUrl(`https://dexscreener.com/solana/${pairAddress}?embed=1&theme=dark&info=0`);
                }

                // 4. Combine data
                const symbol = asset.content?.metadata?.symbol;
                const mockDetails = symbol ? MOCK_TOKEN_DETAILS[symbol] : undefined;

                const tokenData: TokenDetails = {
                    mintAddress: asset.id,
                    name: asset.content?.metadata?.name || mockDetails?.name || 'Unknown Token',
                    symbol: symbol || mockDetails?.symbol || `${asset.id.slice(0,4)}...`,
                    logo: <GenericTokenIcon uri={asset.content?.links?.image} />,
                    description: { en: asset.content?.metadata?.description || mockDetails?.description?.en || '' },
                    pricePerToken: currentPrice,
                    balance: 0, // Not relevant here
                    usdValue: 0, // Not relevant here
                    decimals: asset.token_info?.decimals || mockDetails?.decimals || 0,
                    pairAddress: pairAddress || mockDetails?.pairAddress,
                    // Add missing properties with defaults
                    security: mockDetails?.security || { isMutable: false, mintAuthorityRevoked: true, freezeAuthorityRevoked: true },
                    marketCap: mockDetails?.marketCap || 0,
                    volume24h: mockDetails?.volume24h || 0,
                    price24hChange: mockDetails?.price24hChange || 0,
                    holders: mockDetails?.holders || 0,
                    circulatingSupply: mockDetails?.circulatingSupply || 0,
                    // Add optional properties from mock if they exist
                    audit: mockDetails?.audit,
                    dextScore: mockDetails?.dextScore,
                    communityTrust: mockDetails?.communityTrust,
                    poolCreated: mockDetails?.poolCreated,
                };
                setToken(tokenData);

            } catch (error) {
                console.error("Failed to fetch token details:", error);
                const mockToken = Object.values(MOCK_TOKEN_DETAILS).find(t => t.mintAddress === mintAddress);
                if (mockToken) {
                    setToken(mockToken);
                    if (mockToken.pairAddress) {
                        setChartUrl(`https://dexscreener.com/solana/${mockToken.pairAddress}?embed=1&theme=dark&info=0`);
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTokenData();
    }, [mintAddress]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
            </div>
        );
    }
    
    if (!token) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                <Link to={from || '/dashboard'} className="text-accent-500 hover:underline mt-4 inline-block">{from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}</Link>
            </div>
        );
    }
    
    const description = token.description[currentLanguage.code] || token.description['en'] || '';

    return (
        <div className="animate-fade-in text-primary-100 -mt-8 -mx-8 p-1 bg-primary-950">
            <div className="bg-primary-900 rounded-lg p-2 space-y-2">
                <TokenDetailHeader token={token} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    <div className="lg:col-span-2 space-y-2">
                       <div className="bg-primary-800 rounded-md h-[450px] lg:h-auto lg:min-h-[450px] flex flex-col">
                            <div className="p-4 flex items-center justify-between border-b border-primary-700">
                                <div className="text-2xl font-bold text-primary-100">
                                     ${price > 0.001 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : price.toPrecision(4)}
                                </div>
                            </div>
                            <div className="flex-grow">
                               {chartUrl ? (
                                    <iframe
                                        src={chartUrl}
                                        className="w-full h-full rounded-b-md"
                                        frameBorder="0"
                                        allowFullScreen
                                        title={`${token.symbol} Chart`}
                                    ></iframe>
                                ) : (
                                    <div className="flex-grow flex items-center justify-center">
                                        <p className="text-primary-500">Live Chart Not Available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <TokenInfoPanel token={token} price={price} />
                    </div>
                </div>

                <div className="bg-primary-800 rounded-md p-3 mt-2">
                    <h3 className="text-sm font-bold mb-2">{t('token_description_title')}</h3>
                    <p className="text-xs text-primary-400">{description}</p>
                </div>
                 <Link to={from || '/dashboard'} className="inline-block text-sm text-accent-400 hover:underline p-2 mt-4">
                    &larr; {from === '/profile' ? t('back_to_profile') : t('back_to_dashboard')}
                </Link>
            </div>
        </div>
    );
}