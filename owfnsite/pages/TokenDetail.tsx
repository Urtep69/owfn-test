import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import type { TokenDetails, CandlestickData, LiveTransaction } from '../lib/types.js';
import { ArrowLeft, Loader2, AlertTriangle, Info, BarChart2, ShieldCheck, PieChart, CheckCircle, XCircle, Users, Droplets, RefreshCw, ChevronDown } from 'lucide-react';
import { AddressDisplay } from '../components/AddressDisplay.js';
import { formatNumber } from '../lib/utils.js';
import { GenericTokenIcon } from '../components/IconComponents.js';
import { DualProgressBar } from '../components/DualProgressBar.js';

declare const LightweightCharts: any;

const DetailItem = ({ label, value, children }: { label: string, value?: React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex justify-between items-center py-2 border-b border-primary-200/50 dark:border-darkPrimary-700/50 text-sm">
        <span className="text-primary-500 dark:text-darkPrimary-400">{label}</span>
        <div className="font-semibold text-primary-800 dark:text-darkPrimary-100 text-right break-all">
            {value ?? children}
        </div>
    </div>
);

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children?: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d h-full">
        <div className="flex items-center gap-3 mb-3">
            {icon}
            <h2 className="text-md font-bold">{title}</h2>
        </div>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

const generateCandlestickData = (basePrice: number, count: number): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let lastClose = basePrice;
    let currentTime = Math.floor(Date.now() / 1000) - count * 300; // 5 minute intervals

    for (let i = 0; i < count; i++) {
        const open = lastClose;
        const close = open + (Math.random() - 0.5) * (open * 0.02);
        const high = Math.max(open, close) + Math.random() * (open * 0.005);
        const low = Math.min(open, close) - Math.random() * (open * 0.005);
        data.push({ time: currentTime, open, high, low, close });
        lastClose = close;
        currentTime += 300;
    }
    return data;
};

export default function TokenDetail() {
    const { t } = useAppContext();
    const [match, params] = useRoute<{ mint: string }>("/dashboard/token/:mint");
    const [location] = useLocation();
    const mintAddress = match && params ? params.mint : undefined;

    const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const seriesRef = useRef<any>(null);

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
        if (
            loading || 
            !tokenDetails || 
            !chartContainerRef.current || 
            chartRef.current || 
            typeof LightweightCharts === 'undefined' ||
            !LightweightCharts?.createChart
        ) return;
        
        const chart = LightweightCharts.createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
            layout: {
                background: { color: 'transparent' },
                textColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#1f2937',
            },
            grid: {
                vertLines: { color: 'rgba(128, 128, 128, 0.1)' },
                horzLines: { color: 'rgba(128, 128, 128, 0.1)' },
            },
            timeScale: { timeVisible: true, secondsVisible: false },
        });
        
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
        });
        
        const mockData = generateCandlestickData(tokenDetails.pricePerToken || 0.00001, 200);
        candlestickSeries.setData(mockData);
        chart.timeScale().fitContent();

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;
        
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
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
    }, [loading, tokenDetails]);


    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
            </div>
        );
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

    return (
        <div className="animate-fade-in-up space-y-6">
            <Link to={fromPath} className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline mb-2">
                <ArrowLeft size={16} /> {t(fromPath.includes('dashboard') ? 'back_to_dashboard' : 'back_to_profile')}
            </Link>

            <header className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <GenericTokenIcon uri={tokenDetails.logo as string | undefined} className="w-12 h-12" />
                        <div>
                            <h1 className="text-2xl font-bold">{tokenDetails.name}</h1>
                            <span className="font-mono text-primary-500 dark:text-darkPrimary-400">{tokenDetails.symbol}/SOL</span>
                        </div>
                    </div>
                     <div className="text-left md:text-right">
                        <p className="text-3xl font-bold">${formatNumber(tokenDetails.pricePerToken)}</p>
                        <p className={`font-semibold ${priceChangeColor}`}>
                            {(tokenDetails.price24hChange ?? 0).toFixed(2)}% (24h)
                        </p>
                    </div>
                </div>
            </header>

            <main className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d">
                        <div ref={chartContainerRef} style={{ aspectRatio: '16 / 9', minHeight: '400px' }}></div>
                    </div>
                </div>

                <aside className="col-span-12 lg:col-span-3 space-y-6">
                    <InfoCard title={t('market_stats')} icon={<BarChart2 size={20} />}>
                        <DetailItem label={t('liquidity')} value={`$${formatNumber(tokenDetails.liquidity ?? 0)}`} />
                        <DetailItem label={t('market_cap')} value={`$${formatNumber(tokenDetails.marketCap ?? 0)}`} />
                        <DetailItem label={t('fully_diluted_valuation')} value={`$${formatNumber(tokenDetails.fdv ?? 0)}`} />
                        <DetailItem label={t('volume_24h')} value={`$${formatNumber(tokenDetails.volume24h ?? 0)}`} />
                        <DetailItem label={t('holders')} value={formatNumber(tokenDetails.holders ?? 0)} />
                    </InfoCard>
                    {tokenDetails.poolInfo && (
                        <InfoCard title={t('pool_info')} icon={<Droplets size={20} />}>
                            <DetailItem label={`${tokenDetails.poolInfo.quoteToken?.address === 'So11111111111111111111111111111111111111112' ? 'SOL' : 'Quote'} Amount`} value={formatNumber(tokenDetails.poolInfo.quoteToken?.amount ?? 0)} />
                            <DetailItem label={`${tokenDetails.symbol} Amount`} value={formatNumber(tokenDetails.poolInfo.baseToken?.amount ?? 0)} />
                            <DetailItem label={t('pair_address')} children={<AddressDisplay address={tokenDetails.pairAddress ?? ''} />} />
                        </InfoCard>
                    )}
                    <InfoCard title={t('on_chain_security')} icon={<ShieldCheck size={20} />}>
                        <DetailItem label={t('is_mintable')}>
                            {tokenDetails.mintAuthority ? <XCircle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                        </DetailItem>
                        <DetailItem label={t('is_freezable')}>
                            {tokenDetails.freezeAuthority ? <XCircle className="text-red-500" /> : <CheckCircle className="text-green-500" />}
                        </DetailItem>
                         <DetailItem label={t('mint_authority')}>
                            {tokenDetails.mintAuthority ? <AddressDisplay address={tokenDetails.mintAuthority} /> : <span>{t('revoked')}</span>}
                        </DetailItem>
                    </InfoCard>
                </aside>
            </main>
        </div>
    );
}
