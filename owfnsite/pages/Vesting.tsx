
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, Calendar, Lock, Unlock, PlusCircle } from 'lucide-react';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { VestingSchedule } from '../types.ts';


const ConnectWalletPrompt = () => {
    const { t, solana, setWalletModalOpen } = useAppContext();
    return (
        <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
            <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('vesting_connect_title')}</h2>
            <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('vesting_connect_prompt')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                disabled={solana.loading}
                className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
            >
                {solana.loading ? t('connecting') : t('connect_wallet')}
            </button>
        </div>
    );
};

const NoScheduleInfo = () => {
    const { t } = useAppContext();
    return (
        <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
            <Calendar className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('no_vesting_schedule')}</h2>
            <p className="text-primary-600 dark:text-darkPrimary-400">{t('no_vesting_schedule_desc')}</p>
        </div>
    );
}

const VestingScheduleDetails = ({ schedule }: { schedule: VestingSchedule }) => {
    const { t, solana } = useAppContext();
    const [claimedAmount, setClaimedAmount] = useState(schedule.claimedAmount);
    
    const now = new Date();
    const totalDuration = schedule.endDate.getTime() - schedule.startDate.getTime();
    const elapsedDuration = now.getTime() - schedule.startDate.getTime();
    
    const vestedPercentage = Math.min(100, (elapsedDuration / totalDuration) * 100);
    const totalVested = (schedule.totalAmount * vestedPercentage) / 100;
    
    const isAfterCliff = schedule.cliffDate ? now >= schedule.cliffDate : true;
    const claimableNow = isAfterCliff ? Math.max(0, totalVested - claimedAmount) : 0;
    
    const remainingAmount = schedule.totalAmount - claimedAmount;

    const handleClaim = async () => {
        const result = await solana.claimVestedTokens(claimableNow);
        if (result.success) {
            alert(t(result.messageKey, result.params));
            // Simulate updating the claimed amount locally
            setClaimedAmount(prev => prev + claimableNow);
        } else {
            alert(t(result.messageKey));
        }
    };

    const formatDate = (date?: Date) => date ? new Intl.DateTimeFormat('en-CA').format(date) : 'N/A';

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d space-y-6">
            <h2 className="text-2xl font-bold">{t('my_vesting_schedule')}</h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                    <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_allocation')}</p>
                    <p className="text-xl font-bold">{schedule.totalAmount.toLocaleString()} OWFN</p>
                </div>
                <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                    <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('claimed')}</p>
                    <p className="text-xl font-bold">{claimedAmount.toLocaleString()} OWFN</p>
                </div>
                <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                    <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('remaining')}</p>
                    <p className="text-xl font-bold">{remainingAmount.toLocaleString()} OWFN</p>
                </div>
            </div>
            
            <div>
                <ProgressBar progress={vestedPercentage} label={t('vesting_progress')} />
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 border-t border-primary-200 dark:border-darkPrimary-700 pt-6">
                 <div className="flex justify-between"><span className="font-semibold">{t('start_date')}:</span><span>{formatDate(schedule.startDate)}</span></div>
                 <div className="flex justify-between"><span className="font-semibold">{t('end_date')}:</span><span>{formatDate(schedule.endDate)}</span></div>
                 <div className="flex justify-between"><span className="font-semibold">{t('cliff_period')}:</span><span>{formatDate(schedule.cliffDate)}</span></div>
            </div>

            <div className="bg-accent-100/30 dark:bg-darkAccent-900/30 p-6 rounded-lg text-center">
                <p className="text-lg font-semibold text-accent-700 dark:text-darkAccent-300">{t('claimable_now')}</p>
                <p className="text-4xl font-bold my-2 text-accent-600 dark:text-darkAccent-400">{claimableNow.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <button onClick={handleClaim} disabled={solana.loading || claimableNow <= 0} className="mt-4 w-full max-w-xs bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 rounded-lg text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors disabled:opacity-50">
                    <Unlock className="inline-block mr-2" size={20}/>
                    {solana.loading ? t('processing') : t('claim_tokens')}
                </button>
            </div>
        </div>
    );
};

const AdminPortal = () => {
    const { t, addVestingSchedule, vestingSchedules } = useAppContext();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [duration, setDuration] = useState('');
    const [cliff, setCliff] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSchedule: VestingSchedule = {
            recipientAddress: recipient,
            totalAmount: parseFloat(amount),
            claimedAmount: 0,
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + parseInt(duration))),
            cliffDate: new Date(new Date().setMonth(new Date().getMonth() + parseInt(cliff))),
        };
        addVestingSchedule(newSchedule);
        alert(t('vesting_schedule_created'));
        // Reset form
        setRecipient(''); setAmount(''); setDuration(''); setCliff('');
    };

    return (
        <div className="mt-12 space-y-8">
            <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-6 flex items-center"><PlusCircle className="mr-3 text-accent-500 dark:text-darkAccent-400"/>{t('create_vesting_schedule')}</h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                    <input type="text" placeholder={t('recipient_address')} value={recipient} onChange={e => setRecipient(e.target.value)} required className="w-full p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                    <input type="number" placeholder={t('total_amount_owfn')} value={amount} onChange={e => setAmount(e.target.value)} required className="w-full p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                    <input type="number" placeholder={t('vesting_duration_months')} value={duration} onChange={e => setDuration(e.target.value)} required className="w-full p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                    <input type="number" placeholder={t('cliff_period_months')} value={cliff} onChange={e => setCliff(e.target.value)} required className="w-full p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-md" />
                    <button type="submit" className="md:col-span-2 w-full bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 py-3 rounded-lg font-bold hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors">{t('create_schedule')}</button>
                </form>
            </div>
            <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                 <h2 className="text-2xl font-bold mb-6">{t('all_vesting_schedules')}</h2>
                 <div className="space-y-4">
                     {vestingSchedules.map(schedule => (
                         <div key={schedule.recipientAddress} className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                            <AddressDisplay address={schedule.recipientAddress}/>
                            <p className="text-sm">{t('total_allocation')}: {schedule.totalAmount.toLocaleString()} OWFN</p>
                            <p className="text-sm">{t('end_date')}: {new Intl.DateTimeFormat('en-CA').format(schedule.endDate)}</p>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};


export default function Vesting() {
    const { t, solana, vestingSchedules } = useAppContext();

    const userSchedule = useMemo(() => {
        if (!solana.connected || !solana.address) return null;
        return vestingSchedules.find(s => s.recipientAddress === solana.address);
    }, [solana.connected, solana.address, vestingSchedules]);

    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('vesting_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('vesting_subtitle')}
                </p>
            </div>
            
            {!solana.connected && <ConnectWalletPrompt />}

            {solana.connected && userSchedule && <VestingScheduleDetails schedule={userSchedule} />}
            
            {solana.connected && !userSchedule && !isAdmin && <NoScheduleInfo />}

            {isAdmin && <AdminPortal />}

        </div>
    );
}
