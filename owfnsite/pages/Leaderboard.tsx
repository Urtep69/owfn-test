import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { LeaderboardEntry } from '../types.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import { WalletAvatar } from '../components/WalletAvatar.tsx';
import { Trophy } from 'lucide-react';

// Mock data simulating a fetch from a database
const MOCK_LEADERBOARD_DATA: LeaderboardEntry[] = [
    { rank: 1, address: '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy', totalDonatedUSD: 15230.75 },
    { rank: 2, address: 'So11111111111111111111111111111111111111112', totalDonatedUSD: 12105.50 },
    { rank: 3, address: 'G2U5hNBc6s1Y4W1n6W2b3X9Y7c1Z5t2eR8v3P6y4D1oA', totalDonatedUSD: 9876.21 },
    { rank: 4, address: 'Fp3zQ5b9j6s2d1K8a7w4oE6v9U2i1N7pG8c3X5b2A4d1', totalDonatedUSD: 8543.90 },
    { rank: 5, address: '9Hj7kL4m1n2p3o5r6s8t9u1v2w3x4y5z6a7b8c9d0e1f', totalDonatedUSD: 7210.00 },
    { rank: 6, address: 'C1a2b3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2', totalDonatedUSD: 6500.88 },
    { rank: 7, address: 'X9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8', totalDonatedUSD: 5123.45 },
    { rank: 8, address: 'L6k5j4i3h2g1f0e9d8c7b6a5z4y3x2w1v0u9t8s7r6q5', totalDonatedUSD: 4987.12 },
    { rank: 9, address: 'P0o9i8u7y6t5r4e3w2q1a2s3d4f5g6h7j8k9l0m1n2b3', totalDonatedUSD: 3201.00 },
    { rank: 10, address: 'M5n4b3v2c1x0z9a8s7d6f5g4h3j2k1l0p9o8i7u6y5t4', totalDonatedUSD: 2500.00 },
];


export default function Leaderboard() {
    const { t } = useAppContext();
    const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
    
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
                            {MOCK_LEADERBOARD_DATA.map((entry) => (
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
            </div>
        </div>
    );
}