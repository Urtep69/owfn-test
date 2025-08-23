
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'wouter';
import { Loader2, ArrowLeft, Database, Shield, TrendingUp, Repeat, Droplets, Info, BarChart2, Star, Share2, Globe, Twitter, Send, ExternalLink, HelpCircle, Check, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails, Trade } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon } from '../components/IconComponents.tsx';
import { DiscordIcon } from '../components/IconComponents.tsx';
import { DualProgressBar } from '../components/DualProgressBar.tsx';
import { SolIcon, OwfnIcon } from '../components/IconComponents.tsx';

// --- Helper Functions & Components ---
const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return 'N/A';
    if (price < 0.000001) return `$0.0...${price.toExponential(2).split('e-')[1]}`;
    if (price < 1) return `$${price.toPrecision(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatLargeNumber = (num?: number): string => {
    if (num === undefined || num === null) return 'N/A';
    if (Math.abs(num) < 1000) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (Math.abs(num) < 1_000_000) return `${(num / 1000).toFixed(2)}K`;
    if (Math.abs(num) < 1_000_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    return `${(num / 1_000_000_000).toFixed(2)}B`;
};

const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-CA');
};

const InfoCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d">
        <h3 className="text-md font-bold mb-3 text-primary-800 dark:text-darkPrimary-200">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);

const InfoRow = ({ label, children }: { label:string, children:React.ReactNode }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-primary-600 dark:text-darkPrimary-400">{label}</span>
        <div className="font-semibold text-primary-800 dark:text-darkPrimary-200 text-right break-all">{children}</div>
    </div>
);

const AuthorityRow = ({ label, address, t }: { label:string, address?:string|null, t: (key: string) => string }) => (
    <InfoRow label={label}>
        {address ? <AddressDisplay address={address} /> : <span className="text-green-500 font-bold flex items-center gap-1"><Check size={14}/> {t('revoked')}</span>}
    </InfoRow>
);

const SecurityCheckRow = ({ label, value }: { label: string, value: boolean }) => (
     <InfoRow label={label}>
        <div className={`flex items-center gap-1.5 font-bold ${value ? 'text-green-500' : 'text-red-500'}`}>
            {value ? <Check size={16}/> : <X size={16}/>}
            <span>{value ? 'Yes' : 'No'}</span>
        </div>
    </InfoRow>
);

const useInterval = (callback: () => void, delay: number | null) => {
    const savedCallback = React.useRef(callback);
    useEffect(() => { savedCallback.current = callback; }, [callback]);
    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

// --- Main Component ---
export default function TokenDetail() {
    const { t, theme } = useAppContext();
    const params = useParams();
    const mintAddress = params?.['mint'];
    
    const query = new URLSearchParams(window.location.search);
    const fromPath = query.get('from') || '/dashboard';
    const backLinkText = fromPath === '/profile' ? t('back_to_profile') : t('back_to_dashboard');

    const [token, setToken] = useState<Partial<TokenDetails> | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTokenData = useCallback(async () => {
        if (!mintAddress) return;
        try {
            const response = await fetch(`/api/token-info?mint=${mintAddress}`);
            if (!response.ok) throw new Error((await response.json()).error || "Failed to fetch token data.");
            setToken(await response.json());
        } catch (err) {
            console.error("Failed to fetch token details:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        }
    }, [mintAddress]);
    
    const fetchTrades = useCallback(async () => {
        if (token?.pairAddress) {
             try {
                const response = await fetch(`/api/token-info?type=trades&pair=${token.pairAddress}`);
                if (response.ok) setTrades(await response.json());
            } catch (err) { console.error("Failed to fetch trades:", err); }
        }
    }, [token?.pairAddress]);

    useEffect(() => {
        setLoading(true);
        fetchTokenData().finally(() => setLoading(false));
    }, [fetchTokenData]);

    useInterval(fetchTokenData, 30000); // Refresh main data every 30s
    useInterval(fetchTrades, 10000); // Refresh trades every 10s

    useEffect(() => {
        if (token?.pairAddress) fetchTrades(); // Fetch trades once token data is loaded
    }, [token?.pairAddress, fetchTrades]);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>;
    }

    if (error || !token) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                <Link to={fromPath} className="text-accent-500 hover:underline mt-4 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> {backLinkText}
                </Link>
            </div>
        );
    }
    
    const pooledQuoteSymbol = token.quoteToken?.symbol === 'SOL' ? <SolIcon className="w-3 h-3"/> : <span>{token.quoteToken?.symbol}</span>;
    const pooledBaseSymbol = token.symbol === 'OWFN' ? <OwfnIcon className="w-3 h-3"/> : <span>{token.symbol}</span>;
    const isFreezable = token.freezeAuthority !== null;
    const isMintable = token.mintAuthority !== null;
    
    const priceChange = token.priceChange?.h24 ?? 0;
    const price = token.pricePerToken ?? 0;
    const quoteTokenPrice = price / (token.liquidity?.usd ?? 1) * (token.liquidity?.quote ?? 0);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {backLinkText}
            </Link>

            {/* Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex items-center gap-3 flex-grow">
                    <GenericTokenIcon uri={token.logo as string} className="w-12 h-12 flex-shrink-0" />
                    <div>
                        <h1 className="text-2xl font-bold">{token.name} / {token.quoteToken?.symbol}</h1>
                        <p className="text-primary-500 dark:text-darkPrimary-400 font-semibold text-md">${token.symbol}</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <button className="p-2 rounded-md hover:bg-primary-200 dark:hover:bg-darkPrimary-700"><Star size={20}/></button>
                    <button className="p-2 rounded-md hover:bg-primary-200 dark:hover:bg-darkPrimary-700"><Share2 size={20}/></button>
                </div>
            </header>

            {/* Price Info */}
            <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold">{formatPrice(price)}</p>
                    <div className={`px-2 py-1 rounded-md text-lg font-bold ${priceChange >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                    </div>
                </div>
                 <p className="text-lg text-primary-600 dark:text-darkPrimary-400 font-mono">{quoteTokenPrice.toPrecision(4)} {token.quoteToken?.symbol}</p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6 items-start">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-4">
                    <InfoCard title={t('market_stats')}>
                        <InfoRow label={t('market_cap')}>${formatLargeNumber(token.fdv)}</InfoRow>
                        <InfoRow label={t('liquidity')}>${formatLargeNumber(token.liquidity?.usd)}</InfoRow>
                        <InfoRow label={t('volume_24h')}>${formatLargeNumber(token.volume?.h24)}</InfoRow>
                        <InfoRow label={t('holders')}>N/A</InfoRow>
                        <InfoRow label={t('circulating_supply')}>N/A</InfoRow>
                    </InfoCard>
                     <InfoCard title={t('pool_info')}>
                        <InfoRow label={`Pooled ${token.quoteToken?.symbol}`}>{<span className="flex items-center gap-1 justify-end">{pooledQuoteSymbol} {formatLargeNumber(token.liquidity?.quote)}</span>}</InfoRow>
                        <InfoRow label={`Pooled ${token.symbol}`}>{<span className="flex items-center gap-1 justify-end">{pooledBaseSymbol} {formatLargeNumber(token.liquidity?.base)}</span>}</InfoRow>
                        <InfoRow label={t('pool_age')}>{formatDate(token.poolCreatedAt)}</InfoRow>
                    </InfoCard>
                    <InfoCard title={t('on_chain_security')}>
                         <AuthorityRow label={t('mint_authority')} address={token.mintAuthority} t={t} />
                         <AuthorityRow label={t('freeze_authority')} address={token.freezeAuthority} t={t} />
                         <SecurityCheckRow label={t('is_mintable')} value={isMintable} />
                         <SecurityCheckRow label={t('is_freezable')} value={isFreezable} />
                    </InfoCard>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="w-full h-[500px] bg-primary-50 dark:bg-darkPrimary-950 rounded-lg">
                       {token.chainId && token.pairAddress && (
                           <iframe 
                                src={`https://dexscreener.com/${token.chainId}/${token.pairAddress}?embed=1&theme=${theme}`}
                                className="w-full h-full rounded-lg border-0"
                                allowFullScreen
                           />
                       )}
                    </div>
                    {/* Trade History */}
                     <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d">
                        <h3 className="text-md font-bold mb-3">{t('trading_stats')}</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="text-gray-500 dark:text-gray-400 uppercase bg-primary-100 dark:bg-darkPrimary-700">
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2 text-right">Price USD</th>
                                        <th className="p-2 text-right">Amount ({token.symbol})</th>
                                        <th className="p-2 text-right">Total</th>
                                        <th className="p-2">Maker</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trades.map(trade => (
                                        <tr key={trade.txHash} className="border-b dark:border-darkPrimary-700 hover:bg-primary-50 dark:hover:bg-darkPrimary-700/50">
                                            <td className="p-2">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                                            <td className={`p-2 font-bold ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</td>
                                            <td className="p-2 text-right font-mono">{formatPrice(trade.priceUsd)}</td>
                                            <td className="p-2 text-right font-mono">{formatLargeNumber(trade.amountBase)}</td>
                                            <td className="p-2 text-right font-mono">${formatLargeNumber(trade.amountQuote)}</td>
                                            <td className="p-2"><AddressDisplay address={trade.maker} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Section */}
            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d space-y-6">
                <h2 className="text-2xl font-bold">PepeWifPork Live Price and Buy Information</h2>
                <p className="text-primary-600 dark:text-darkPrimary-400">
                    The PepeWifPork live price is {formatPrice(price)} USD with a market cap of {formatLargeNumber(token.fdv)} USD, a 24-hour trading volume of {formatLargeNumber(token.volume?.h24)} USD.
                </p>
                <div className="space-y-4">
                    <details className="border-b dark:border-darkPrimary-700 pb-2">
                        <summary className="font-semibold cursor-pointer flex justify-between">How much is 1 PEPEWP? <HelpCircle size={16} className="inline-block"/> </summary>
                        <p className="mt-2 text-primary-600 dark:text-darkPrimary-400">The price of 1 PEPEWP is {formatPrice(price)}.</p>
                    </details>
                     <details className="border-b dark:border-darkPrimary-700 pb-2">
                        <summary className="font-semibold cursor-pointer flex justify-between">Which is the PEPEWP contract on Solana? <HelpCircle size={16} className="inline-block"/> </summary>
                        <p className="mt-2 text-primary-600 dark:text-darkPrimary-400"><AddressDisplay address={mintAddress!} type="token"/></p>
                    </details>
                </div>

                <h3 className="text-xl font-bold pt-4">How much PEPEWP can I buy with 100 USD?</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary-100 dark:bg-darkPrimary-700">
                            <tr>
                                <th className="p-2">USD</th>
                                <th className="p-2 text-right">{token.symbol}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 5, 10, 25, 50, 100, 500, 1000].map(usd => (
                                <tr key={usd} className="border-b dark:border-darkPrimary-700">
                                    <td className="p-2">${usd}</td>
                                    <td className="p-2 text-right font-mono">{price > 0 ? (usd/price).toLocaleString(undefined, {maximumFractionDigits: 2}) : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
