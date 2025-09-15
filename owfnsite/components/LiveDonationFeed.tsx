import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import type { DonationTransaction } from '../lib/types.js';
import { AddressDisplay } from './AddressDisplay.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from './IconComponents.js';
import { Loader2 } from 'lucide-react';

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
        <div className="bg-dextools-card border border-dextools-border p-6 rounded-md h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-dextools-accent-green rounded-full animate-pulse"></div>
                <h3 className="text-dextools-text-primary font-bold text-xl">{t('live_donation_feed')}</h3>
            </div>
            <div className="border-b border-dextools-border mb-4 flex">
                {TABS.map(tokenSymbol => (
                    <button
                        key={tokenSymbol}
                        onClick={() => setActiveTab(tokenSymbol)}
                        className={`flex items-center gap-2 py-2 px-4 font-semibold transition-colors text-sm ${
                            activeTab === tokenSymbol 
                                ? 'border-b-2 border-dextools-accent-blue text-dextools-text-primary' 
                                : 'text-dextools-text-secondary hover:bg-dextools-border'
                        }`}
                    >
                        {getTokenIcon(tokenSymbol, 'w-4 h-4')}
                        {tokenSymbol}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-6 gap-2 text-xs text-dextools-text-secondary pb-2 border-b border-dextools-border font-semibold">
                <span className="col-span-3">{t('wallet')}</span>
                <span className="text-right col-span-2">{t('amount_donated')}</span>
                <span className="text-right">{t('time')}</span>
            </div>

            <div className="flex-grow overflow-y-auto space-y-1 pr-1 -mr-2 mt-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full pt-16">
                        <Loader2 className="w-8 h-8 animate-spin text-dextools-accent-blue" />
                    </div>
                ) : transactionsForDisplay.length > 0 ? (
                    transactionsForDisplay.slice(0, 50).map((tx) => (
                        <div key={tx.id} className={`grid grid-cols-6 gap-2 items-center text-sm p-1.5 rounded-md animate-fade-in ${tx.time.getTime() > Date.now() - 15000 ? 'bg-dextools-special/10' : ''}`}>
                            <div className="col-span-3 flex items-center gap-2">
                                <AddressDisplay address={tx.address} className="text-xs" />
                            </div>
                            <div className="text-right font-mono col-span-2 text-dextools-text-primary">
                                {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                            </div>
                            <div className="text-right text-xs text-dextools-text-secondary">
                                {renderTimeAgo(tx.time)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-dextools-text-secondary">
                        <p>{t('donations_no_recent_donations_for_token', { token: activeTab })}</p>
                    </div>
                )}
            </div>
        </div>
    );
};