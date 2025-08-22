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
        <div className="text-center p-12 glassmorphism rounded-lg">
            <Wallet className="mx-auto w-16 h-16 text-accent-light mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('vesting_connect_title')}</h2>
            <p className="text-text-secondary mb-6">{t('vesting_connect_prompt')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                disabled={solana.loading}
                className="text-white bg-gradient-to-r from-accent to-accent-light font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-lg hover:shadow-glow-accent disabled:opacity-50"
            >
                {solana.loading ? t('connecting') : t('connect_wallet')}
            </button>
        </div>
    );
};

const NoScheduleInfo = () => {
    const { t } = useAppContext();
    return (
        <div className="text-center p-12 glassmorphism rounded-lg">
            <Calendar className="mx-auto w-16 h-16 text-accent-light mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('no_vesting_schedule')}</h2>
            <p className="text-text-secondary">{t('no_vesting_schedule_desc')}</p>
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
            alert(t('vesting_claim_success', { amount: claimableNow }));
            setClaimedAmount(prev => prev + claimableNow);
        }
    };

    const formatDate = (date?: Date) => date ? new Intl.DateTimeFormat('en-CA').format(date) : 'N/A';

    return (
        <div className="glassmorphism p-8 rounded-lg space-y-6">
            <h2 className="text-2xl font-bold font-display">{t('my_vesting_schedule')}</h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-surface-dark p-4 rounded-lg border border-border-color">
                    <p className="text-sm text-text-secondary">{t('total_allocation')}</p>
                    <p className="text-xl font-bold font-mono">{schedule.totalAmount.toLocaleString()} OWFN</p>
                </div>
                <div className="bg-surface-dark p-4 rounded-lg border border-border-color">
                    <p className="text-sm text-text-secondary">{t('claimed')}</p>
                    <p className="text-xl font-bold font-mono">{claimedAmount.toLocaleString()} OWFN</p>
                </div>
                <div className="bg-surface-dark p-4 rounded-lg border border-border-color">
                    <p className="text-sm text-text-secondary">{t('remaining')}</p>
                    <p className="text-xl font-bold font-mono">{remainingAmount.toLocaleString()} OWFN</p>
                </div>
            </div>
            
            <div>
                <ProgressBar progress={vestedPercentage} label={t('vesting_progress')} />
            </div>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 border-t border-border-color pt-6">
                 <div className="flex justify-between"><span className="font-semibold">{t('start_date')}:</span><span className="font-mono">{formatDate(schedule.startDate)}</span></div>
                 <div className="flex justify-between"><span className="font-semibold">{t('end_date')}:</span><span className="font-mono">{formatDate(schedule.endDate)}</span></div>
                 <div className="flex justify-between"><span className="font-semibold">{t('cliff_period')}:</span><span className="font-mono">{formatDate(schedule.cliffDate)}</span></div>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent-light/10 p-6 rounded-lg text-center border border-accent/20">
                <p className="text-lg font-semibold text-accent">{t('claimable_now')}</p>
                <p className="text-4xl font-bold my-2 text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light font-display">{claimableNow.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                <button onClick={handleClaim} disabled={solana.loading || claimableNow <= 0} className="mt-4 w-full max-w-xs bg-gradient-to-r from-accent to-accent-light text-white font-bold py-3 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
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
        setRecipient(''); setAmount(''); setDuration(''); setCliff('');
    };

    return (
        <div className="mt-12 space-y-8">
            <div className="glassmorphism p-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-6 flex items-center font-display"><PlusCircle className="mr-3 text-accent"/>{t('create_vesting_schedule')}</h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                    <input type="text" placeholder={t('recipient_address')} value={recipient} onChange={e => setRecipient(e.target.value)} required className="w-full p-3 bg-surface-dark rounded-md border border-border-color focus:ring-2 focus:ring-accent" />
                    <input type="number" placeholder={t('total_amount_owfn')} value={amount} onChange={e => setAmount(e.target.value)} required className="w-full p-3 bg-surface-dark rounded-md border border-border-color focus:ring-2 focus:ring-accent" />
                    <input type="number" placeholder={t('vesting_duration_months')} value={duration} onChange={e => setDuration(e.target.value)} required className="w-full p-3 bg-surface-dark rounded-md border border-border-color focus:ring-2 focus:ring-accent" />
                    <input type="number" placeholder={t('cliff_period_months')} value={cliff} onChange={e => setCliff(e.target.value)} required className="w-full p-3 bg-surface-dark rounded-md border border-border-color focus:ring-2 focus:ring-accent" />
                    <button type="submit" className="md:col-span-2 w-full bg-gradient-to-r from-accent to-accent-light text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity">{t('create_schedule')}</button>
                </form>
            </div>
            <div className="glassmorphism p-8 rounded-lg">
                 <h2 className="text-2xl font-bold mb-6 font-display">{t('all_vesting_schedules')}</h2>
                 <div className="space-y-4 max-h-96 overflow-y-auto">
                     {vestingSchedules.map(schedule => (
                         <div key={schedule.recipientAddress} className="bg-surface-dark p-4 rounded-lg border border-border-color">
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
        if (!solana.isAuthenticated || !solana.address) return null;
        // Mock finding a schedule for any connected user for demonstration
        return vestingSchedules.find(s => s.recipientAddress === "7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy") || null;
    }, [solana.isAuthenticated, solana.address, vestingSchedules]);
    
    // Add a mock schedule if none exists for demonstration
    if (vestingSchedules.length === 0) {
        vestingSchedules.push({
            recipientAddress: "7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy",
            totalAmount: 1000000,
            claimedAmount: 150000,
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 9)),
            cliffDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
        });
    }

    const isAdmin = solana.isAuthenticated && solana.address === ADMIN_WALLET_ADDRESS;

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">{t('vesting_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
                    {t('vesting_subtitle')}
                </p>
            </div>
            
            {!solana.isAuthenticated && <ConnectWalletPrompt />}

            {solana.isAuthenticated && userSchedule && <VestingScheduleDetails schedule={userSchedule} />}
            
            {solana.isAuthenticated && !userSchedule && !isAdmin && <NoScheduleInfo />}

            {isAdmin && <AdminPortal />}

        </div>
    );
}