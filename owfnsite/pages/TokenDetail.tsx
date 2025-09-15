import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import type { TokenDetails, CandlestickData, LiveTransaction } from '../lib/types.js';
// FIX: Corrected lucide-react imports: 'Fire' does not exist, using 'Flame' instead. Added missing 'TrendingUp' icon.
import { 
    ArrowLeft, Loader2, AlertTriangle, Info, BarChart2, ShieldCheck, PieChart, Users, Droplets, 
    Globe, Twitter, Send, Repeat, WalletCards, ArrowUpRight, ArrowDownLeft, FileText, Flame, TrendingUp
} from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { formatNumber } from '../lib/utils.js';
import { GenericTokenIcon, DiscordIcon } from '../components/IconComponents.js';
import { DualProgressBar } from '../components/DualProgressBar.js';

declare const LightweightCharts: any;

const DetailItem = ({ label, value, children }: { label: string, value?: React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-primary-200/50 dark:border-darkPrimary-700/50 text-sm last:border-b-0">
        <span className="text-primary-500 dark:text-darkPrimary-400">{label}</span>
        <div className="font-semibold text-primary-800 dark:text-darkPrimary-100 text-right break-all">
            {value ?? children}
        </div>
    </div>
);

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children?: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-xl shadow-3d h-full border border-primary-200/30 dark:border-darkPrimary-700/50">
        <div className="flex items-center gap-3 mb-3 text-primary-800 dark:text-darkPrimary-200">
            {icon}
            <h2 className="text-md font-bold">{title}</h2>
        </div>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

const generateCandlestickData = (basePrice: number, count: number, volatility: number): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let lastClose = basePrice > 0 ? basePrice : 0.0001;
    let currentTime = Math.floor(Date.now() / 1000); 

    for (let i = 0; i < count; i++) {
        const open = lastClose;
        const close = open + (Math.random() - 0.5) * (open * volatility);
        const high = Math.max(open, close) + Math.random() * (open * (volatility / 2));
        const low = Math.min(open, close) - Math.random() * (open * (volatility / 2));
        data.push({ time: currentTime, open, high, low, close });
        lastClose = close;
        currentTime -= 300; // Go backwards in time
    }
    return data.reverse();
};

const generateLiveTransactions = (count: number, basePrice: number, tokenSymbol: string): LiveTransaction[] => {
    const txs: LiveTransaction[] = [];
    let lastPrice = basePrice > 0 ? basePrice : 0.0001;
    for (let i = 0; i < count; i++) {
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const priceChange = (Math.random() - 0.5) * (lastPrice * 0.001);
        const priceUsd = lastPrice + priceChange;
        const solAmount = Math.random() * 2 + 0.1;
        const tokenAmount = (solAmount * 150) / priceUsd; // Mock SOL price of 150
        
        const randomWallet = 'xxxx' + Math.random().toString(36).substring(2, 8);
        
        txs.push({
            id: Math.random().toString(),
            time: new Date(Date.now() - i * Math.random() * 20000),
            type,
            priceUsd,
            tokenAmount,
            solAmount,
            maker: randomWallet,
        });
        lastPrice = priceUsd;
    }
    return txs;
};


const LiveTransactionsFeed = ({ basePrice, tokenSymbol }: { basePrice: number, tokenSymbol: string }) => {
    const { t } = useAppContext();
    const [transactions, setTransactions] = useState<LiveTransaction[]>(() => generateLiveTransactions(30, basePrice, tokenSymbol));

    useEffect(() => {
        const interval = setInterval(() => {
            const newTx = generateLiveTransactions(1, transactions[0]?.priceUsd || basePrice, tokenSymbol)[0];
            newTx.time = new Date();
            setTransactions(prev => [newTx, ...prev.slice(0, 49)]);
        }, 3000);
        return () => clearInterval(interval);
    }, [basePrice, tokenSymbol, transactions]);

    const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    return (
        <InfoCard title={t('total_transactions_24h')} icon={<Repeat size={20} />}>
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-xs text-left">
                    <thead className="text-primary-500 dark:text-darkPrimary-400 uppercase sticky top-0 bg-white dark:bg-darkPrimary-800">
                        <tr>
                            <th scope="col" className="py-2">Time</th>
                            <th scope="col" className="py-2">Type</th>
                            <th scope="col" className="py-2 text-right">Price USD</th>
                            <th scope="col" className="py-2 text-right">{tokenSymbol}</th>
                            <th scope="col" className="py-2 text-right">SOL</th>
                            <th scope="col" className="py-2 text-right">Maker</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono">
                        {transactions.map(tx => (
                            <tr key={tx.id} className={`border-t border-primary-200/50 dark:border-darkPrimary-700/50 ${tx.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                                <td className="py-2">{formatTime(tx.time)}</td>
                                <td>{tx.type.toUpperCase()}</td>
                                <td className="py-2 text-right">${tx.priceUsd.toPrecision(4)}</td>
                                <td className="py-2 text-right">{formatNumber(tx.tokenAmount)}</td>
                                <td className="py-2 text-right">{tx.solAmount.toFixed(4)}</td>
                                <td className="py-2 text-right opacity-70">{tx.maker}...</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </InfoCard>
    );
};


export default function TokenDetail() {
    const { t } = useAppContext();
    const [match, params] = useRoute<{ mint: string }>("/dashboard/token/:mint");
    const [location] = useLocation();
    const mintAddress = match && params ? params.mint : undefined;

    const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeframe, setTimeframe] = useState('1D');
    
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);

    const fromPath = new URLSearchParams(location.split('?')[1] || '').get('from') || '/dashboard';

    const fetchTokenDetails = useCallback(async () => {
        if (!mintAddress) {
            setError('No mint address provided.');
            setLoading(false);
            return;
        }
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
    }, [mintAddress]);

    useEffect(() => {
        fetchTokenDetails();
    }, [fetchTokenDetails]);

    useEffect(() => {
        if (!tokenDetails || !chartContainerRef.current || typeof LightweightCharts === 'undefined') {
            return;
        }

        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const chart = LightweightCharts.createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: { background: { color: 'transparent' }, textColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937' },
            grid: { vertLines: { color: 'rgba(128, 128, 128, 0.1)' }, horzLines: { color: 'rgba(128, 128, 128, 0.1)' } },
            timeScale: { timeVisible: true, secondsVisible: false },
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22c55e', downColor: '#ef4444', borderDownColor: '#ef4444',
            borderUpColor: '#22c55e', wickDownColor: '#ef4444', wickUpColor: '#22c55e',
        });
        
        const timeframeVolatility: { [key: string]: number } = { '1H': 0.005, '4H': 0.01, '1D': 0.02, '1W': 0.05, '1M': 0.1 };
        const mockData = generateCandlestickData(tokenDetails.pricePerToken, 200, timeframeVolatility[timeframe] || 0.02);
        candlestickSeries.setData(mockData);
        chart.timeScale().fitContent();
        chartRef.current = chart;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.resize(chartContainerRef.current.clientWidth, 400);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [loading, tokenDetails, timeframe]);

    if (loading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" /></div>;
    }

    if (error || !tokenDetails) {
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
    
    const priceChangeColor = (tokenDetails.price24hChange ?? 0) >= 0 ? 'text-green-500' : 'text-red-500';
    const PriceChangeIcon = (tokenDetails.price24hChange ?? 0) >= 0 ? ArrowUpRight : ArrowDownLeft;
    const timeframes = ['1H', '4H', '1D', '1W', '1M'];
    const totalTxns = (tokenDetails.txns?.h24.buys ?? 0) + (tokenDetails.txns?.h24.sells ?? 0);

    return (
        <div className="animate-fade-in-up space-y-6">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline mb-2">
                <ArrowLeft size={16} /> {t(fromPath.includes('dashboard') ? 'back_to_dashboard' : 'back_to_profile')}
            </Link>

            <header className="bg-white dark:bg-darkPrimary-800 p-6 rounded-xl shadow-3d space-y-4 border border-primary-200/30 dark:border-darkPrimary-700/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <GenericTokenIcon uri={tokenDetails.logo as string | undefined} className="w-16 h-16" />
                        <div>
                            <h1 className="text-3xl font-bold">{tokenDetails.name}</h1>
                            <span className="text-lg font-mono text-primary-500 dark:text-darkPrimary-400">${tokenDetails.symbol}</span>
                        </div>
                    </div>
                     <div className="text-left md:text-right">
                        <p className="text-4xl font-bold">${tokenDetails.pricePerToken.toPrecision(6)}</p>
                        <p className={`font-semibold text-lg flex items-center justify-start md:justify-end gap-1 ${priceChangeColor}`}>
                            <PriceChangeIcon size={20} />
                            {(tokenDetails.price24hChange ?? 0).toFixed(2)}% (24h)
                        </p>
                    </div>
                </div>
                 <div className="flex flex-wrap justify-between items-center gap-4 border-t border-primary-200/50 dark:border-darkPrimary-700/50 pt-4">
                    <div className="flex items-center gap-3">
                        <a href={tokenDetails.links?.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"><Globe size={20}/></a>
                        <a href={tokenDetails.links?.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"><Twitter size={20}/></a>
                        <a href={tokenDetails.links?.telegram} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"><Send size={20}/></a>
                        <a href={tokenDetails.links?.discord} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"><DiscordIcon className="w-5 h-5"/></a>
                    </div>
                     <div className="flex flex-wrap items-center gap-2">
                        <button disabled className="px-3 py-1.5 text-sm font-semibold bg-primary-200 dark:bg-darkPrimary-700 rounded-lg flex items-center gap-2 opacity-50 cursor-not-allowed"><WalletCards size={16} /> Add to Wallet</button>
                        <button disabled className="px-3 py-1.5 text-sm font-semibold bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 rounded-lg flex items-center gap-2 opacity-50 cursor-not-allowed"><Repeat size={16}/> {t('swap')}</button>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <div className="bg-white dark:bg-darkPrimary-800 rounded-xl shadow-3d border border-primary-200/30 dark:border-darkPrimary-700/50">
                        <div className="p-3 border-b border-primary-200/50 dark:border-darkPrimary-700/50 flex items-center gap-1">
                            {timeframes.map(tf => (
                                <button key={tf} onClick={() => setTimeframe(tf)} className={`px-3 py-1 text-xs font-semibold rounded-md ${timeframe === tf ? 'bg-accent-400/20 text-accent-700 dark:bg-darkAccent-500/20 dark:text-darkAccent-300' : 'hover:bg-primary-200/50 dark:hover:bg-darkPrimary-700/50'}`}>
                                    {tf}
                                </button>
                            ))}
                        </div>
                        <div className="p-2">
                            <div ref={chartContainerRef} style={{ aspectRatio: '16 / 9', minHeight: '400px' }}></div>
                        </div>
                    </div>
                    {tokenDetails.description && <InfoCard title={t('token_description_title')} icon={<FileText size={20}/>}><p className="text-sm leading-relaxed">{tokenDetails.description}</p></InfoCard>}
                    <LiveTransactionsFeed basePrice={tokenDetails.pricePerToken} tokenSymbol={tokenDetails.symbol} />
                </div>

                <aside className="col-span-12 lg:col-span-4 space-y-6">
                    <InfoCard title={t('market_stats')} icon={<BarChart2 size={20} />}>
                        <DetailItem label={t('market_cap')} value={`$${formatNumber(tokenDetails.marketCap ?? 0)}`} />
                        <DetailItem label={t('fully_diluted_valuation')} value={`$${formatNumber(tokenDetails.fdv ?? 0)}`} />
                        <DetailItem label={t('liquidity')} value={`$${formatNumber(tokenDetails.liquidity ?? 0)}`} />
                        <DetailItem label={t('volume_24h')} value={`$${formatNumber(tokenDetails.volume24h ?? 0)}`} />
                        <DetailItem label={t('holders')} value={formatNumber(tokenDetails.holders ?? 0)} />
                        <DetailItem label={t('total_supply')} value={formatNumber(tokenDetails.totalSupply)} />
                    </InfoCard>
                    {/* FIX: This component was erroring because TrendingUp was not imported */}
                    <InfoCard title={t('trading_stats')} icon={<TrendingUp size={20} />}>
                        <DualProgressBar value1={tokenDetails.txns?.h24.buys ?? 0} label1={t('buys')} value2={tokenDetails.txns?.h24.sells ?? 0} label2={t('sells')} />
                        <DetailItem label={t('total_transactions_24h')} value={formatNumber(totalTxns)} />
                    </InfoCard>
                     {tokenDetails.poolInfo && (
                        <InfoCard title={t('pool_info')} icon={<Droplets size={20} />}>
                            <DetailItem label={`${tokenDetails.symbol} Amount`} value={formatNumber(tokenDetails.poolInfo.baseToken?.amount ?? 0)} />
                            <DetailItem label={`Quote Amount`} value={`${formatNumber(tokenDetails.poolInfo.quoteToken?.amount ?? 0)} SOL`} />
                            <DetailItem label={t('pair_address')} children={<AddressDisplay address={tokenDetails.pairAddress ?? ''} />} />
                            <DetailItem label={t('pool_age')} value={tokenDetails.poolCreatedAt ? new Date(tokenDetails.poolCreatedAt).toLocaleDateString() : 'N/A'} />
                        </InfoCard>
                    )}
                    <InfoCard title={t('on_chain_security')} icon={<ShieldCheck size={20} />}>
                        <DetailItem label={t('mint_authority')}>
                            {tokenDetails.mintAuthority ? <AddressDisplay address={tokenDetails.mintAuthority} /> : <span className="font-bold text-green-500">{t('revoked')}</span>}
                        </DetailItem>
                        <DetailItem label={t('freeze_authority')}>
                           {tokenDetails.freezeAuthority ? <AddressDisplay address={tokenDetails.freezeAuthority} /> : <span className="font-bold text-green-500">{t('revoked')}</span>}
                        </DetailItem>
                        <DetailItem label={t('lp_burned')}>
                            <div className="flex items-center gap-2 justify-end">
                                <Flame className="text-orange-500" size={16}/>
                                <span>{(tokenDetails.lpBurned ?? 0).toFixed(2)}%</span>
                            </div>
                        </DetailItem>
                    </InfoCard>
                </aside>
            </main>
        </div>
    );
}