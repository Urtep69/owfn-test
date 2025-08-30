import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { LeaderboardEntry } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { WalletAvatar } from '../components/WalletAvatar.tsx';
import { Trophy, Loader2 } from 'lucide-react';


export default function Leaderboard() {
    const { t } = useAppContext();
    const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    
    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                // In a real app, you would pass the activeTab to the API
                const response = await fetch(`/api/leaderboard?period=${activeTab}`);
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
    }, [activeTab]);
    
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
                <div className="border-b border-primary-200 dark:border-darkPrimary-700 mb-4 flex">
                    <button onClick={() => setActiveTab('weekly')} disabled className="py-2 px-4 font-semibold text-primary-500 dark:text-darkPrimary-500 disabled:opacity-50">{t('weekly')}</button>
                    <button onClick={() => setActiveTab('monthly')} disabled className="py-2 px-4 font-semibold text-primary-500 dark:text-darkPrimary-500 disabled:opacity-50">{t('monthly')}</button>
                    <button onClick={() => setActiveTab('all-time')} className={`py-2 px-4 font-semibold ${activeTab === 'all-time' ? 'border-b-2 border-accent-500 text-accent-600 dark:border-darkAccent-500 dark:text-darkAccent-400' : 'text-primary-500 dark:text-darkPrimary-500'}`}>{t('all_time')}</button>
                </div>
                
                {loading ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 animate-spin text-accent-500 dark:text-darkAccent-500" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-primary-700 dark:text-darkPrimary-300 uppercase bg-primary-100 dark:bg-darkPrimary-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 w-16">{t('leaderboard_rank')}</th>
                                    <th scope="col" className="px-6 py-3">{t('leaderboard_donor')}</th>
                                    <th scope="col" className="px-6 py-3 text-right">{t('leaderboard_total_donated')}</th>
                                </tr>
                            </thead>
                             <tbody>
                                {leaderboardData.map((entry) => (
                                    <tr key={entry.rank} className="border-b dark:border-darkPrimary-700 hover:bg-primary-50 dark:hover:bg-darkPrimary-700/50">
                                        <td className="px-6 py-4 font-bold text-lg text-center">{entry.rank}</td>
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <WalletAvatar address={entry.address} className="w-10 h-10 flex-shrink-0" />
                                            <AddressDisplay address={entry.address} />
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-lg font-semibold text-green-600 dark:text-green-400">
                                            ${entry.totalDonatedUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}