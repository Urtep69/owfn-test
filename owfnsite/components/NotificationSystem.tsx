import React, { useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { OwfnIcon, SolIcon, UsdcIcon, UsdtIcon, GenericTokenIcon } from './IconComponents.js';
import { X, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

const getTokenIcon = (symbol: string, className = 'w-8 h-8') => {
    switch (symbol) {
        case 'OWFN': return <OwfnIcon className={className} />;
        case 'SOL': return <SolIcon className={className} />;
        case 'USDC': return <UsdcIcon className={className} />;
        case 'USDT': return <UsdtIcon className={className} />;
        default: return <GenericTokenIcon className={className} />;
    }
};

const NotificationToast = ({ notification }) => {
    const { removeNotification } = useAppContext();
    const { id, type, title, message, txSignature, tokenSymbol, amount } = notification;

    useEffect(() => {
        const timer = setTimeout(() => removeNotification(id), 8000); // Auto-dismiss after 8s
        return () => clearTimeout(timer);
    }, [id, removeNotification]);

    const isSuccess = type === 'success';

    const themeClasses = useMemo(() => {
        if (isSuccess) {
            return {
                icon: <CheckCircle className="w-16 h-16 text-green-400" />,
                accentColor: 'border-green-400/50',
                glowColor: 'shadow-[0_0_30px_5px_rgba(34,197,94,0.3)]',
                buttonColor: 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
            };
        }
        return {
            icon: <AlertTriangle className="w-16 h-16 text-red-400" />,
            accentColor: 'border-red-400/50',
            glowColor: 'shadow-[0_0_30px_5px_rgba(248,113,113,0.3)]',
            buttonColor: 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
        };
    }, [isSuccess]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" style={{ animationDuration: '300ms' }}>
            <div className={`relative bg-darkPrimary-800 text-darkPrimary-100 w-full max-w-md rounded-2xl border ${themeClasses.accentColor} ${themeClasses.glowColor} overflow-hidden`}>
                <button onClick={() => removeNotification(id)} className="absolute top-3 right-3 p-2 text-darkPrimary-400 hover:text-white rounded-full transition-colors">
                    <X size={20} />
                </button>
                
                <div className="pt-8 px-8 pb-4 text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-darkPrimary-800 p-2 rounded-full">
                         <OwfnIcon className="w-12 h-12" />
                    </div>
                    
                    <div className="flex justify-center mb-4">
                        {themeClasses.icon}
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-2">{title}</h2>
                    <p className="text-darkPrimary-300 text-sm leading-relaxed">{message}</p>
                </div>
                
                {(tokenSymbol && amount) && (
                    <div className="mx-6 my-4 p-4 bg-darkPrimary-700/50 rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            {getTokenIcon(tokenSymbol)}
                            <span className="font-semibold text-lg">{tokenSymbol}</span>
                        </div>
                        <span className="font-mono text-xl font-bold">{amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                    </div>
                )}
                
                {txSignature && (
                    <div className="px-6 pb-6">
                        <a 
                           href={`https://solscan.io/tx/${txSignature}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="w-full flex items-center justify-center gap-2 text-center py-2 px-4 rounded-lg bg-darkPrimary-700 hover:bg-darkPrimary-600 transition-colors text-sm font-semibold"
                        >
                            <ExternalLink size={16} />
                            View on Solscan
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export const NotificationSystem = () => {
    const { notifications } = useAppContext();
    
    // Render only the first notification in the queue to avoid stacking modals
    if (notifications.length === 0) {
        return null;
    }
    
    return <NotificationToast notification={notifications[0]} />;
};
