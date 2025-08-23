import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'wouter';
import { Loader2, ArrowLeft, Star, Share2, Globe, Twitter, Send, ExternalLink, HelpCircle, Check, X, ChevronDown } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { TokenDetails, Trade } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { GenericTokenIcon, DiscordIcon, SolIcon } from '../components/IconComponents.tsx';

// --- Custom Hook for Intervals ---
const useInterval = (callback: () => void, delay: number | null) => {
    const savedCallback = useRef(callback);
    useEffect(() => { savedCallback.current = callback; }, [callback]);
    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => savedCallback.current(), delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};


// --- Helper & UI Components (defined inside for single-file update) ---

const formatPrice = (price?: number) => {
    if (typeof price !== 'number' || isNaN(price)) return '$--';
    if (price < 0.000001 && price > 0) return `$0.0...${price.toExponential(2).split('e-')[1]}`;
    if (price < 1) return `$${price.toPrecision(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
};

const formatLargeNumber = (num?: number, prefix = '', suffix = ''): string => {
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    const absNum = Math.abs(num);
    let formattedNum;
    if (absNum < 1000) formattedNum = num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    else if (absNum < 1_000_000) formattedNum = `${(num / 1000).toFixed(2)}K`;
    else if (absNum < 1_000_000_000) formattedNum = `${(num / 1_000_000).toFixed(2)}M`;
    else formattedNum = `${(num / 1_000_000_000).toFixed(2)}B`;
    return `${prefix}${formattedNum}${suffix}`;
};

const formatDate = (timestamp?: number): string => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
};

const InfoCard = ({ title, children, className = '' }: { title: string, children: React.ReactNode, className?: string }) => (
    <div className={`bg-primary-100 dark:bg-darkPrimary-800 p-4 rounded-lg shadow-md ${className}`}>
        <h3 className="text-sm font-bold mb-3 text-primary-700 dark:text-darkPrimary-300 uppercase tracking-wider">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ label, children, tooltip }: { label:string, children:React.ReactNode, tooltip?: string }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-primary-600 dark:text-darkPrimary-400 flex items-center gap-1.5">
            {label}
            {tooltip && <span title={tooltip}><HelpCircle size={14} className="cursor-help" /></span>}
        </span>
        <div className="font-semibold text-primary-900 dark:text-darkPrimary-100 text-right break-all">{children}</div>
    </div>
);

const AuthorityStatus = ({ label, address }: { label: string, address?: string | null }) => (
    <InfoRow label={label}>
        {address ? (
            <span className="text-red-500 font-bold flex items-center gap-1.5"><X size={14}/> Active</span>
        ) : (
            <span className="text-green-500 font-bold flex items-center gap-1.5"><Check size={14}/> Revoked</span>
        )}
    </InfoRow>
);

const DualProgressBar = ({ value1, value2 }: { value1: number, value2: number }) => {
  const total = value1 + value2;
  const percentage1 = total > 0 ? (value1 / total) * 100 : 50;

  return (
    <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-primary-200 dark:bg-darkPrimary-700">
      <div className="bg-green-500" style={{ width: `${percentage1}%` }}></div>
      <div className="bg-red-500" style={{ width: `${100 - percentage1}%` }}></div>
    </div>
  );
};


// --- Main Component ---
export default function TokenDetail() {
    const { t, theme, solana } = useAppContext();
    const params = useParams();
    const mintAddress = params?.['mint'];
    
    const [token, setToken] = useState<Partial<TokenDetails> | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllData = useCallback(async () => {
        if (!mintAddress) return;
        try {
            const response = await fetch(`/api/token-info?mint=${mintAddress}`);
            if (!response.ok) throw new Error((await response.json()).error || "Failed to fetch token data.");
            setToken(await response.json());
        } catch (err) {
            console.error("Failed to fetch token details:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setToken(null); // Clear old data on error
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
        setError(null);
        setToken(null);
        setTrades([]);
        fetchAllData().finally(() => setLoading(false));
    }, [fetchAllData]);

    useEffect(() => {
        if (token?.pairAddress) {
            fetchTrades(); // Initial fetch
        }
    }, [token?.pairAddress, fetchTrades]);

    useInterval(fetchAllData, 60000); // Refresh main data every 60s
    useInterval(fetchTrades, 10000); // Refresh trades every 10s

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>;
    }

    if (error || !token) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">{t('token_not_found')}</h2>
                {error && <p className="text-red-400 mt-2">{error}</p>}
                <Link to="/dashboard" className="text-accent-500 hover:underline mt-4 inline-flex items-center gap-2">
                    <ArrowLeft size={16} /> {t('back_to_dashboard')}
                </Link>
            </div>
        );
    }
    
    const priceChange = token.priceChange?.h24 ?? 0;
    const price = token.pricePerToken ?? 0;
    const quotePrice = token.quoteToken?.symbol === 'SOL' ? price / (solana.userTokens.find(t=>t.symbol==='SOL')?.pricePerToken || 1) : 0;

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <GenericTokenIcon uri={token.logo as string} className="w-12 h-12 flex-shrink-0" />
                    <div>
                        <div className="flex items-center gap-2">
                             <h1 className="text-2xl font-bold">{token.name} / {token.quoteToken?.symbol}</h1>
                             <div className="flex items-center gap-2">
                                {token.socials?.website && <a href={token.socials.website} target="_blank" rel="noopener noreferrer"><Globe size={16} /></a>}
                                {token.socials?.twitter && <a href={token.socials.twitter} target="_blank" rel="noopener noreferrer"><Twitter size={16} /></a>}
                                {token.socials?.telegram && <a href={token.socials.telegram} target="_blank" rel="noopener noreferrer"><Send size={16} /></a>}
                                {token.socials?.discord && <a href={token.socials.discord} target="_blank" rel="noopener noreferrer"><DiscordIcon className="w-4 h-4" /></a>}
                             </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-primary-500 dark:text-darkPrimary-400 font-semibold text-md">${token.symbol}</span>
                            <AddressDisplay address={token.mintAddress!} type="token" />
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-2 self-start md:self-center">
                    <button className="p-2 rounded-md hover:bg-primary-200 dark:hover:bg-darkPrimary-700"><Star size={20}/></button>
                    <button className="p-2 rounded-md hover:bg-primary-200 dark:hover:bg-darkPrimary-700"><Share2 size={20}/></button>
                </div>
            </header>

            {/* Price Info */}
            <div className="bg-primary-50 dark:bg-darkPrimary-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-3xl font-bold">{formatPrice(price)}</p>
                    {quotePrice > 0 && <p className="text-md text-primary-600 dark:text-darkPrimary-400 font-mono flex items-center gap-1.5"><SolIcon className="w-4 h-4"/> {quotePrice.toPrecision(5)}</p>}
                </div>
                <div className={`px-3 py-1.5 rounded-md text-lg font-bold ${priceChange >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}% (24h)
                </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-4">
                    <InfoCard title="Market Stats">
                        <InfoRow label="Market Cap" tooltip="Fully Diluted Valuation">${formatLargeNumber(token.fdv)}</InfoRow>
                        <InfoRow label="Liquidity">${formatLargeNumber(token.liquidity?.usd)}</InfoRow>
                        <InfoRow label="24h Volume">${formatLargeNumber(token.volume?.h24)}</InfoRow>
                        <InfoRow label="Holders">N/A</InfoRow>
                        <InfoRow label="Circ. Supply">N/A</InfoRow>
                    </InfoCard>
                     <InfoCard title="Pool Info">
                        <InfoRow label={`Pooled ${token.quoteToken?.symbol}`}>{formatLargeNumber(token.liquidity?.quote)}</InfoRow>
                        <InfoRow label={`Pooled ${token.symbol}`}>{formatLargeNumber(token.liquidity?.base)}</InfoRow>
                        <InfoRow label="Pool Created">{formatDate(token.poolCreatedAt)}</InfoRow>
                        <InfoRow label="DEX">{token.dexId}</InfoRow>
                    </InfoCard>
                    <InfoCard title="24h Trading Stats">
                        <DualProgressBar value1={token.txns?.h24.buys || 0} value2={token.txns?.h24.sells || 0}/>
                        <InfoRow label="Buys / Sells">{token.txns?.h24.buys} / {token.txns?.h24.sells}</InfoRow>
                        <InfoRow label="Buy / Sell Volume">{formatLargeNumber(token.txns?.h24.buysVolume, '$')} / {formatLargeNumber(token.txns?.h24.sellsVolume, '$')}</InfoRow>
                    </InfoCard>
                    <InfoCard title="On-chain Security">
                         <AuthorityStatus label="Mint Authority" address={token.mintAuthority} />
                         <AuthorityStatus label="Freeze Authority" address={token.freezeAuthority} />
                         <AuthorityStatus label="Update Authority" address={token.updateAuthority} />
                    </InfoCard>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 xl:col-span-3 space-y-4">
                    <div className="w-full h-[500px] bg-primary-50 dark:bg-darkPrimary-950 rounded-lg">
                       {token.chainId && token.pairAddress && (
                           <iframe 
                                src={`https://dexscreener.com/${token.chainId}/${token.pairAddress}?embed=1&theme=${theme}&info=0`}
                                className="w-full h-full rounded-lg border-0"
                                allowFullScreen
                           />
                       )}
                    </div>
                     <div className="bg-primary-50 dark:bg-darkPrimary-800 p-4 rounded-lg shadow-md">
                        <h3 className="text-sm font-bold mb-3 text-primary-700 dark:text-darkPrimary-300 uppercase tracking-wider">Trade History</h3>
                        <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-xs text-left">
                                <thead className="text-primary-500 dark:text-darkPrimary-400 uppercase bg-primary-100 dark:bg-darkPrimary-900/50 sticky top-0">
                                    <tr>
                                        <th className="p-2">Time</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2 text-right">Price USD</th>
                                        <th className="p-2 text-right">Amount ({token.symbol})</th>
                                        <th className="p-2 text-right">Total</th>
                                        <th className="p-2">Maker</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trades.map((trade, idx) => (
                                        <tr key={`${trade.txHash}-${idx}`} className="border-b border-primary-200 dark:border-darkPrimary-700 hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50">
                                            <td className="p-2">{new Date(trade.timestamp).toLocaleTimeString()}</td>
                                            <td className={`p-2 font-bold ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</td>
                                            <td className="p-2 text-right font-mono">{formatPrice(trade.priceUsd)}</td>
                                            <td className="p-2 text-right font-mono">{formatLargeNumber(trade.amountBase)}</td>
                                            <td className="p-2 text-right font-mono">{formatLargeNumber(trade.amountQuote, '$')}</td>
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
            <div className="bg-primary-50 dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-2xl font-bold">{token.name} Live Price and Information</h2>
                {token.description && <p className="text-primary-600 dark:text-darkPrimary-400">{token.description}</p>}
                
                <div className="space-y-4">
                    <details className="border-b border-primary-200 dark:border-darkPrimary-700 pb-2">
                        <summary className="font-semibold cursor-pointer flex justify-between items-center">How much is 1 ${token.symbol}? <ChevronDown className="w-5 h-5"/></summary>
                        <p className="mt-2 text-primary-600 dark:text-darkPrimary-400">The price of 1 ${token.symbol} is {formatPrice(price)} USD.</p>
                    </details>
                     <details className="border-b border-primary-200 dark:border-darkPrimary-700 pb-2">
                        <summary className="font-semibold cursor-pointer flex justify-between items-center">What is the ${token.symbol} contract on Solana? <ChevronDown className="w-5 h-5"/></summary>
                        <div className="mt-2 text-primary-600 dark:text-darkPrimary-400"><AddressDisplay address={mintAddress!} type="token"/></div>
                    </details>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div>
                        <h3 className="text-xl font-bold mb-4">How much ${token.symbol} can I buy?</h3>
                         <div className="overflow-x-auto rounded-lg border border-primary-200 dark:border-darkPrimary-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-primary-100 dark:bg-darkPrimary-900/50">
                                    <tr>
                                        <th className="p-3">USD</th>
                                        <th className="p-3 text-right">{token.symbol}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 5, 10, 25, 50, 100, 500, 1000].map(usd => (
                                        <tr key={usd} className="border-t border-primary-200 dark:border-darkPrimary-700">
                                            <td className="p-3 font-semibold">${usd.toLocaleString()}</td>
                                            <td className="p-3 text-right font-mono">{price > 0 ? (usd/price).toLocaleString(undefined, {maximumFractionDigits: 2}) : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">How to buy ${token.symbol}?</h3>
                        <div className="bg-primary-100 dark:bg-darkPrimary-900/50 p-4 rounded-lg space-y-2 text-primary-700 dark:text-darkPrimary-300">
                           <p>1. Connect your wallet to a DEX like Raydium or Jupiter.</p>
                           <p>2. Ensure you have SOL in your wallet for the purchase and transaction fees.</p>
                           <p>3. Swap your SOL for ${token.symbol} using the mint address.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}