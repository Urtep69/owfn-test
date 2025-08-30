import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { LeaderboardEntry, TokenDonationDetail } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { WalletAvatar } from '../components/WalletAvatar.tsx';
import { Trophy, Loader2 } from 'lucide-react';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon } from '../components/IconComponents.tsx';

const TOKEN_ORDER = ['OWFN', 'SOL', 'USDC', 'USDT'];
const TOKEN_ICONS: { [key: string]: React.ReactNode } = {
    OWFN: <OwfnIcon className="w-5 h-5" />,
    SOL: <SolIcon className="w-5 h-5" />,
    USDC: <UsdcIcon className="w-5 h-5" />,
    USDT: <UsdtIcon className="w-5 h-5" />
};

const TokenDonationCell = ({ symbol, data }: { symbol: string, data?: TokenDonationDetail }) => {
    if (!data) {
        return <div className="text-center text-primary-400 dark:text-darkPrimary-500">-</div>;
    }
    
    return (
        <div className="flex flex-col text-xs font-mono px-2">
            <span className="font-bold text-primary-800 dark:text-darkPrimary-200">
                {data.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {data.symbol}
            </span>
            <span className="text-primary-600 dark:text-darkPrimary-400">
                (${data.totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </span>
            <span className="text-primary-500 dark:text-darkPrimary-500 text-[10px] mt-0.5">
                {new Date(data.lastDonationDate).toLocaleDateString()}
            </span>
        </div>
    );
};


export default function Leaderboard() {
    const { t, currentLanguage } = useAppContext();
    const [activePeriod, setActivePeriod] = useState('all-time');
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    
    const periods = [
        { key: 'weekly', label: t('weekly') },
        { key: 'monthly', label: t('monthly') },
        { key: '3months', label: t('leaderboard_3_months') },
        { key: '6months', label: t('leaderboard_6_months') },
        { key: '9months', label: t('leaderboard_9_months') },
        { key: '1year', label: t('leaderboard_1_year') },
        { key: 'all-time', label: t('all_time') },
    ];

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/leaderboard?period=${activePeriod}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard data');
                }
                const data: LeaderboardEntry[] = await response.json();
                setLeaderboardData(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                setLeaderboardData([]); // Clear data on error
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [activePeriod]);
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <Trophy className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-400 mb-4" />
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('leaderboards')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('leaderboards_desc')}
                </p>
            </div>
            
            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
                <div className="border-b border-primary-200 dark:border-darkPrimary-700 mb-4 flex flex-wrap">
                    {periods.map(period => (
                         <button 
                            key={period.key}
                            onClick={() => setActivePeriod(period.key)} 
                            className={`py-2 px-4 font-semibold transition-colors duration-200 ${activePeriod === period.key 
                                ? 'border-b-2 border-accent-500 text-accent-600 dark:border-darkAccent-500 dark:text-darkAccent-400' 
                                : 'text-primary-500 dark:text-darkPrimary-500 hover:bg-primary-100 dark:hover:bg-darkPrimary-700/50'}`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
                
                {loading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-sm text-left">
                            <thead className="text-xs text-primary-700 dark:text-darkPrimary-300 uppercase bg-primary-100 dark:bg-darkPrimary-700">
                                <tr>
                                    <th scope="col" className="px-4 py-3 w-16 text-center">{t('leaderboard_rank')}</th>
                                    <th scope="col" className="px-6 py-3 min-w-[300px]">{t('leaderboard_donor')}</th>
                                    {TOKEN_ORDER.map(token => (
                                        <th key={token} scope="col" className="px-2 py-3">
                                            <div className="flex items-center gap-2">{TOKEN_ICONS[token]} {token}</div>
                                        </th>
                                    ))}
                                    <th scope="col" className="px-6 py-3 text-right">{t('leaderboard_total_donated')}</th>
                                </tr>
                            </thead>
                             <tbody>
                                {leaderboardData.length > 0 ? leaderboardData.map((entry) => (
                                    <tr key={entry.rank} className="border-b dark:border-darkPrimary-700 hover:bg-primary-50 dark:hover:bg-darkPrimary-700/50">
                                        <td className="px-4 py-4 font-bold text-lg text-center">{entry.rank}</td>
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <WalletAvatar address={entry.address} className="w-10 h-10 flex-shrink-0" />
                                            <AddressDisplay address={entry.address} />
                                        </td>
                                        {TOKEN_ORDER.map(token => (
                                            <td key={token} className="py-4">
                                                <TokenDonationCell 
                                                    symbol={token} 
                                                    data={entry.donationsByToken.find(d => d.symbol === token)} 
                                                />
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 text-right font-mono text-lg font-semibold text-green-600 dark:text-green-400">
                                            ${entry.totalDonatedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={TOKEN_ORDER.length + 3} className="text-center py-10 text-primary-500 dark:text-darkPrimary-400">No donations found for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}