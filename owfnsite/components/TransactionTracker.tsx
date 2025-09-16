import React, { useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
// FIX: Imported the missing 'X' icon component from lucide-react.
import { Loader2, ArrowUpRight, CheckCircle, XCircle, X } from 'lucide-react';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from './IconComponents.js';
import type { TrackedTransaction } from '../lib/types.js';

const getTokenIcon = (symbol: string) => {
    const className = "w-8 h-8";
    switch(symbol) {
        case 'OWFN': return <OwfnIcon className={className} />;
        case 'SOL': return <SolIcon className={className} />;
        case 'USDC': return <UsdcIcon className={className} />;
        case 'USDT': return <UsdtIcon className={className} />;
        default: return <GenericTokenIcon className={className} />;
    }
}

const TransactionStatusIndicator = ({ status }: { status: TrackedTransaction['status'] }) => {
    const { t } = useAppContext();

    const statusInfo = useMemo(() => {
        switch (status) {
            case 'sending':
                return { icon: <Loader2 className="w-5 h-5 animate-spin" />, text: t('tx_status_sending'), color: 'text-blue-400' };
            case 'confirming':
                return { icon: <Loader2 className="w-5 h-5 animate-spin" />, text: t('tx_status_confirming'), color: 'text-amber-400' };
            case 'finalized':
                return { icon: <CheckCircle className="w-5 h-5" />, text: t('tx_status_finalized'), color: 'text-green-400' };
            case 'failed':
                 return { icon: <XCircle className="w-5 h-5" />, text: t('tx_status_failed'), color: 'text-red-400' };
            default:
                return { icon: null, text: '', color: '' };
        }
    }, [status, t]);

    return (
        <div className={`flex items-center gap-2 text-sm font-semibold ${statusInfo.color}`}>
            {statusInfo.icon}
            <span>{statusInfo.text}</span>
        </div>
    );
};

export const TransactionTracker = () => {
    const { t, trackedTransaction, stopTrackingTransaction, updateTrackedTransactionStatus, solana } = useAppContext();

    useEffect(() => {
        if (!trackedTransaction) return;

        let intervalId: NodeJS.Timeout | null = null;
        let confirmationTimeoutId: NodeJS.Timeout | null = null;
        let finalizationTimeoutId: NodeJS.Timeout | null = null;

        const checkStatus = async () => {
            try {
                const status = await solana.connection.getSignatureStatus(trackedTransaction.signature, {
                    searchTransactionHistory: true,
                });

                if (status?.value?.confirmationStatus === 'finalized') {
                    updateTrackedTransactionStatus(trackedTransaction.signature, 'finalized');
                    if (intervalId) clearInterval(intervalId);
                    if (confirmationTimeoutId) clearTimeout(confirmationTimeoutId);
                    finalizationTimeoutId = setTimeout(stopTrackingTransaction, 4000); // Linger for 4s
                } else if (status?.value?.confirmationStatus === 'confirmed') {
                    updateTrackedTransactionStatus(trackedTransaction.signature, 'confirming');
                }
            } catch (error) {
                console.error("Error checking transaction status:", error);
            }
        };

        intervalId = setInterval(checkStatus, 2000); // Poll every 2s
        confirmationTimeoutId = setTimeout(() => { // Fail after 60s
            if (trackedTransaction.status !== 'finalized') {
                 updateTrackedTransactionStatus(trackedTransaction.signature, 'failed');
                 if (intervalId) clearInterval(intervalId);
                 finalizationTimeoutId = setTimeout(stopTrackingTransaction, 6000);
            }
        }, 60000);

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (confirmationTimeoutId) clearTimeout(confirmationTimeoutId);
            if (finalizationTimeoutId) clearTimeout(finalizationTimeoutId);
        };
    }, [trackedTransaction, solana.connection, updateTrackedTransactionStatus, stopTrackingTransaction]);


    if (!trackedTransaction) {
        return null;
    }

    const { signature, status, amount, tokenSymbol, type } = trackedTransaction;
    const title = type === 'donation' ? t('journey_made_donation') : t('journey_made_purchase');
    
    return (
        <div className="fixed bottom-5 right-5 w-full max-w-sm bg-darkPrimary-800/80 backdrop-blur-xl text-white rounded-lg shadow-3d-lg border border-primary-200/20 animate-slide-in z-50">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold">{title}</h4>
                        <TransactionStatusIndicator status={status} />
                    </div>
                    <button onClick={stopTrackingTransaction} className="p-1 text-darkPrimary-400 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-4 bg-darkPrimary-700/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                        {getTokenIcon(tokenSymbol)}
                        <div>
                            <p className="font-mono text-xl font-bold">{amount.toLocaleString(undefined, {maximumFractionDigits: 4})}</p>
                            <p className="text-sm font-semibold text-darkPrimary-300 -mt-1">{tokenSymbol}</p>
                        </div>
                    </div>
                    <a 
                       href={`https://solscan.io/tx/${signature}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center gap-1.5 text-sm font-semibold text-accent-500 hover:text-accent-400 transition-colors"
                    >
                        {t('view_on_solscan')} <ArrowUpRight size={16} />
                    </a>
                </div>
            </div>
            <div className="w-full bg-primary-200/20 h-1 rounded-b-lg">
                 <div 
                    className={`h-full rounded-b-lg transition-all duration-500 ${status === 'finalized' ? 'bg-green-500' : 'bg-accent-500'}`}
                    style={{ width: status === 'sending' ? '33%' : status === 'confirming' ? '66%' : '100%'}}
                 ></div>
            </div>
        </div>
    );
};
