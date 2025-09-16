import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import type { DonationTransaction } from '../lib/types.js';
import { AddressDisplay } from './AddressDisplay.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from './IconComponents.js';
import { SkeletonLoader } from './SkeletonLoader.js';

const getTokenIcon = (symbol: string, className = 'w-5 h-5') => {
    switch (symbol) {
        case 'OWFN': return <OwfnIcon className={className} />;
        case 'SOL': return <SolIcon className={className} />;
        case 'USDC': return <UsdcIcon className={className} />;
        case 'USDT': return <UsdtIcon className={className} />;
        default: return <GenericTokenIcon className={className} />;
    }
};

interface LiveDonationFeedProps {
    allTransactions: DonationTransaction[];
    isLoading: boolean;
}

const TransactionSkeletonRow = () => (
    <div className="grid grid-cols-6 gap-2 items-center text-sm p-1.5 rounded-md">
        <div className="col-span-3">
            <SkeletonLoader className="h-5 w-32" />
        </div>
        <div className="text-right col-span-2">
            <SkeletonLoader className="h-5 w-16 ml-auto" />
        </div>
        <div className="text-right">
            <SkeletonLoader className="h-5 w-12 ml-auto" />
        </div>
    </div>
);

export const LiveDonationFeed = ({ allTransactions, isLoading }: LiveDonationFeedProps) => {
    const { t } = useAppContext();
    const [activeTab, setActiveTab] = useState('SOL');
    
    const TABS = ['SOL', 'USDC', 'USDT', 'OWFN'];

    const categorizedTransactions = useMemo(() => {
        const categories: Record<string, DonationTransaction[]> = { SOL: [], USDC: [], USDT: [], OWFN: [] };
        for (const tx of allTransactions) {
            if (categories[tx.tokenSymbol]) {
                categories[tx.tokenSymbol].push(tx);
            }
        }
        // Ensure lists are always sorted by time
        for (const key in categories) {
            categories[key].sort((a, b) => b.time.getTime() - a.time.getTime());
        }
        return categories;
    }, [allTransactions]);

    const transactionsForDisplay = categorizedTransactions[activeTab] || [];

    const renderTimeAgo = (date: Date) => {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return t('just_now');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t('time_minutes_ago', { minutes });
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('time_hours_ago', { hours });
        const days = Math.floor(hours / 24);
        return t('time_days_ago', { days });
    };

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-primary-900 dark:text-darkPrimary-100 font-bold text-xl">{t('live_donation_feed')}</h3>
            </div>

            <div className="border-b border-primary-200 dark:border-darkPrimary-700 mb-4 flex">
                {TABS.map(tokenSymbol => (
                    <button
                        key={tokenSymbol}
                        onClick={() => setActiveTab(tokenSymbol)}
                        className={`flex items-center gap-2 py-2 px-4 font-semibold transition-colors text-sm ${
                            activeTab === tokenSymbol 
                                ? 'border-b-2 border-accent-500 text-accent-600 dark:border-darkAccent-400 dark:text-darkAccent-400' 
                                : 'text-primary-500 dark:text-darkPrimary-400 hover:bg-primary-100 dark:hover:bg-darkPrimary-700'
                        }`}
                    >
                        {getTokenIcon(tokenSymbol, 'w-4 h-4')}
                        {tokenSymbol}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-6 gap-2 text-xs text-primary-500 dark:text-darkPrimary-400 pb-2 border-b border-primary-200 dark:border-darkPrimary-700 font-semibold">
                <span className="col-span-3">{t('wallet')}</span>
                <span className="text-right col-span-2">{t('amount_donated')}</span>
                <span className="text-right">{t('time')}</span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-1 pr-1 -mr-2 mt-2 custom-scrollbar">
                {isLoading ? (
                    <div className="pt-2">
                        {[...Array(10)].map((_, i) => <TransactionSkeletonRow key={i} />)}
                    </div>
                ) : transactionsForDisplay.length > 0 ? (
                    transactionsForDisplay.slice(0, 50).map((tx) => (
                        <div key={tx.id} className={`grid grid-cols-6 gap-2 items-center text-sm p-1.5 rounded-md animate-fade-in-up ${tx.time.getTime() > Date.now() - 15000 ? 'bg-accent-100/50 dark:bg-darkAccent-500/10' : ''}`}>
                            <div className="col-span-3 flex items-center gap-2">
                                <AddressDisplay address={tx.address} className="text-xs" />
                            </div>
                            <div className="text-right font-mono col-span-2">
                                {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            </div>
                            <div className="text-right text-xs text-primary-500 dark:text-darkPrimary-500">
                                {renderTimeAgo(tx.time)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-primary-500 dark:text-darkPrimary-400">
                        <p>{t('donations_no_recent_donations_for_token', { token: activeTab })}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
