import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Lock, Calendar, Loader2 } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { VestingSchedule } from '../types.ts';

const VestingScheduleCard = ({ schedule }: { schedule: VestingSchedule }) => {
    const { t } = useAppContext();
    
    const now = new Date();
    const totalDuration = schedule.endDate.getTime() - schedule.startDate.getTime();
    const elapsedDuration = Math.max(0, now.getTime() - schedule.startDate.getTime());
    
    const vestedPercentage = totalDuration > 0 ? Math.min(100, (elapsedDuration / totalDuration) * 100) : 100;
    const totalVested = (schedule.totalAmount * vestedPercentage) / 100;
    
    const isAfterCliff = schedule.cliffDate ? now >= schedule.cliffDate : true;
    const claimableNow = isAfterCliff ? Math.max(0, totalVested - schedule.claimedAmount) : 0;

    const formatDate = (date?: Date) => date ? new Intl.DateTimeFormat('en-CA').format(date) : 'N/A';

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d space-y-4 transform hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-xl font-bold">{schedule.recipientName}</h3>
            <AddressDisplay address={schedule.recipientAddress} />

            <div className="bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('total_allocation')}</p>
                <p className="text-2xl font-bold">{schedule.totalAmount.toLocaleString()} OWFN</p>
            </div>
            
            <div>
                <ProgressBar progress={vestedPercentage} label={t('vesting_progress')} />
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-primary-200 dark:border-darkPrimary-700 pt-4">
                <div className="font-semibold text-primary-600 dark:text-darkPrimary-400">{t('start_date')}:</div>
                <div className="text-right">{formatDate(schedule.startDate)}</div>
                
                <div className="font-semibold text-primary-600 dark:text-darkPrimary-400">{t('end_date')}:</div>
                <div className="text-right">{formatDate(schedule.endDate)}</div>

                <div className="font-semibold text-primary-600 dark:text-darkPrimary-400">{t('cliff_period')}:</div>
                <div className="text-right">{formatDate(schedule.cliffDate)}</div>
            </div>

             <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-primary-200 dark:border-darkPrimary-700 pt-4">
                 <div className="font-semibold">{t('claimed')}:</div>
                 <div className="text-right font-mono">{schedule.claimedAmount.toLocaleString()}</div>
                 <div className="font-semibold text-green-600 dark:text-green-400">{t('claimable_now')}:</div>
                 <div className="text-right font-mono text-green-600 dark:text-green-400">{claimableNow.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
            </div>
        </div>
    );
};

export default function Vesting() {
    const { t, vestingSchedules, isLoadingData } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400 flex items-center justify-center gap-4">
                    <Lock />
                    {t('vesting_title')}
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('vesting_subtitle')}
                </p>
            </div>

            {isLoadingData ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
                </div>
            ) : vestingSchedules.length > 0 ? (
                 <div className="grid md:grid-cols-2 gap-8">
                    {vestingSchedules.map(schedule => (
                        <VestingScheduleCard key={schedule.id} schedule={schedule} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-inner-3d">
                    <Calendar className="mx-auto w-16 h-16 text-primary-400 dark:text-darkPrimary-500 mb-4" />
                    <p className="text-primary-600 dark:text-darkPrimary-400">{t('no_vesting_schedule_desc')}</p>
                </div>
            )}
        </div>
    );
}
