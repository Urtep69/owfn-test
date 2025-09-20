import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Loader2, Download, User, RefreshCw } from 'lucide-react';

interface AirdropParticipant {
    wallet_address: string;
    created_at: string;
}

interface AirdropStats {
    totalParticipants: number;
    participants: AirdropParticipant[];
}

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-primary-100 dark:bg-darkPrimary-700 text-accent-500 dark:text-darkAccent-400 rounded-full p-3">
            {icon}
        </div>
        <div>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{title}</p>
            <p className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">{value}</p>
        </div>
    </div>
);

export default function AdminAirdrop() {
    const { t } = useAppContext();
    const [stats, setStats] = useState<AirdropStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/admin-airdrop');
            if (!response.ok) {
                throw new Error('Failed to fetch airdrop data.');
            }
            const data: AirdropStats = await response.json();
            setStats(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const exportToCsv = useCallback(() => {
        if (!stats || stats.participants.length === 0) return;

        const headers = ['wallet_address', 'registration_date'];
        const rows = stats.participants.map(p => [
            p.wallet_address,
            new Date(p.created_at).toISOString()
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `owfn_airdrop_participants_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [stats]);

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t('airdrop_admin_title', { defaultValue: 'Airdrop Administration' })}</h1>
                    <p className="text-primary-600 dark:text-darkPrimary-400 mt-1">{t('airdrop_admin_subtitle', { defaultValue: 'Monitor participants and export data for distribution.' })}</p>
                </div>
                <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 bg-primary-200 dark:bg-darkPrimary-700 px-4 py-2 rounded-lg font-semibold hover:bg-primary-300 dark:hover:bg-darkPrimary-600 disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                    {t('refresh_data')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20"><Loader2 className="w-12 h-12 animate-spin text-accent-500"/></div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : (
                <>
                    <div className="grid md:grid-cols-1 gap-6">
                        <StatCard title={t('airdrop_total_participants', { defaultValue: 'Total Participants' })} value={stats?.totalParticipants ?? 0} icon={<User />} />
                    </div>

                    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('airdrop_participant_list', { defaultValue: 'Participant List' })}</h2>
                            <button onClick={exportToCsv} disabled={!stats || stats.participants.length === 0} className="flex items-center gap-2 bg-primary-200 dark:bg-darkPrimary-700 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-300 dark:hover:bg-darkPrimary-600 disabled:opacity-50">
                                <Download size={16} /> {t('export_csv')}
                            </button>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] relative">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-primary-700 dark:text-darkPrimary-300 uppercase bg-primary-100 dark:bg-darkPrimary-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">{t('wallet_address', { defaultValue: 'Wallet Address' })}</th>
                                        <th scope="col" className="px-6 py-3">{t('registration_date', { defaultValue: 'Registration Date' })}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.participants.map(p => (
                                        <tr key={p.wallet_address} className="border-b dark:border-darkPrimary-700 hover:bg-primary-50 dark:hover:bg-darkPrimary-700/50">
                                            <td className="px-6 py-4 font-mono">{p.wallet_address}</td>
                                            <td className="px-6 py-4">{new Date(p.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}