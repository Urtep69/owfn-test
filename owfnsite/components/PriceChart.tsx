import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { useAppContext } from '../contexts/AppContext.js';
import { Loader2, AlertTriangle } from 'lucide-react';

interface PriceChartProps {
    mintAddress: string;
}

const timeframes = ['1m', '5m', '1h', '24h', '7d', '30d'];

export const PriceChart = ({ mintAddress }: PriceChartProps) => {
    const { theme } = useAppContext();
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const candlestickSeriesRef = useRef<any>(null);

    const [activeTimeframe, setActiveTimeframe] = useState('5m');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // This effect handles data fetching whenever the token or timeframe changes.
    useEffect(() => {
        const fetchChartData = async () => {
            if (!candlestickSeriesRef.current) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/token-chart?mint=${mintAddress}&timeframe=${activeTimeframe}`);
                if (!res.ok) {
                    throw new Error(`Failed to fetch chart data: ${res.statusText}`);
                }
                const data = await res.json();
                if (data.error) {
                    throw new Error(data.error);
                }
                candlestickSeriesRef.current.setData(data);
                chartRef.current?.timeScale().fitContent(); // Adjust view to fit new data
            } catch (err) {
                console.error(err);
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchChartData();
    }, [mintAddress, activeTimeframe]);

    // This effect initializes the chart and handles its lifecycle.
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chartOptions = {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: theme === 'dark' ? '#D1D5DB' : '#374151',
            },
            grid: {
                vertLines: { color: theme === 'dark' ? '#44403c' : '#e7e5e4' },
                horzLines: { color: theme === 'dark' ? '#44403c' : '#e7e5e4' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: activeTimeframe === '1m' || activeTimeframe === '5m',
            },
            crosshair: {
                mode: 1, // Magnet mode for better UX
            },
        };

        chartRef.current = createChart(chartContainerRef.current, chartOptions);
        candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
        });
        
        // Initial data fetch is now handled by the other useEffect
        setLoading(true);

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove the chart and event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // This effect updates the chart's appearance when the theme changes.
    useEffect(() => {
        if (!chartRef.current) return;
        chartRef.current.applyOptions({
            layout: {
                textColor: theme === 'dark' ? '#D1D5DB' : '#374151',
            },
            grid: {
                vertLines: { color: theme === 'dark' ? '#44403c' : '#e7e5e4' },
                horzLines: { color: theme === 'dark' ? '#44403c' : '#e7e5e4' },
            },
        });
    }, [theme]);

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-3d h-[500px] flex flex-col">
            <div className="flex items-center space-x-2 mb-2">
                {timeframes.map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setActiveTimeframe(tf)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            activeTimeframe === tf
                                ? 'bg-accent-500 text-white dark:bg-darkAccent-500 dark:text-darkPrimary-950'
                                : 'bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-700 dark:hover:bg-darkPrimary-600'
                        }`}
                    >
                        {tf.toUpperCase()}
                    </button>
                ))}
            </div>
            <div className="relative flex-grow">
                 {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-darkPrimary-800/50 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                    </div>
                )}
                {error && !loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-darkPrimary-800/50 z-10 flex-col p-4">
                         <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                         <p className="text-red-500 font-semibold text-center">Could not load chart data.</p>
                         <p className="text-xs text-primary-500 dark:text-darkPrimary-500 text-center">{error}</p>
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full h-full" />
            </div>
        </div>
    );
};
