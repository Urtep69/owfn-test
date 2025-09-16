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
            };
        }
        return {
            icon: <AlertTriangle className="w-16 h-16 text-red-400" />,
            accentColor: 'border-red-400/50',
            glowColor: 'shadow-[0_0_30px_5px_rgba(248,113,113,0.3)]',
        };
    }, [isSuccess]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" style={{ animationDuration: '300ms' }}>
            <div className="relative w-full max-w-lg">
                {/* Logo positioned relative to the wrapper to avoid being clipped */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-darkPrimary-800 p-2 rounded-full z-20">
                     <OwfnIcon className="w-16 h-16" />
                </div>

                <div className={`relative bg-darkPrimary-800 text-darkPrimary-100 rounded-2xl border ${themeClasses.accentColor} ${themeClasses.glowColor}`}>
                    <button onClick={() => removeNotification(id)} className="absolute top-3 right-3 p-2 text-darkPrimary-400 hover:text-white rounded-full transition-colors z-10">
                        <X size={20} />
                    </button>
                    
                    <div className="pt-14 px-6 md:px-8 pb-4 text-center">
                        <div className="flex justify-center mb-4">
                            {themeClasses.icon}
                        </div>
                        
                        <h2 className="text-2xl font-bold mb-2">{title}</h2>
                        <p className="text-darkPrimary-300 text-sm leading-relaxed">{message}</p>
                    </div>
                    
                    {(tokenSymbol && amount != null) && (
                        <div className="mt-2 mb-6 px-6">
                            <div className="flex items-center justify-center gap-4 bg-darkPrimary-700/50 py-3 px-6 rounded-xl border border-darkPrimary-600">
                                {getTokenIcon(tokenSymbol, 'w-12 h-12 flex-shrink-0')}
                                <div className="text-left">
                                    <p className="font-mono text-3xl font-bold text-white tracking-wider">
                                        {amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                    </p>
                                    <p className="text-sm font-semibold text-darkPrimary-300 -mt-1">
                                        {tokenSymbol}
                                    </p>
                                </div>
                            </div>
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