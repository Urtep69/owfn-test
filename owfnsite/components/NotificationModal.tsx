import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';
import { OwfnIcon } from './IconComponents.js';

export const NotificationModal = () => {
    const { notification, hideNotification, t } = useAppContext();

    if (!notification) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up" 
            style={{ animationDuration: '200ms' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-title"
        >
            <div className="relative bg-white dark:bg-darkPrimary-800 w-full max-w-md rounded-2xl shadow-3d-lg p-6 pt-20 text-center border border-primary-200 dark:border-darkPrimary-700">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-darkPrimary-800 rounded-full p-2">
                    <OwfnIcon className="w-24 h-24" />
                </div>
                
                <div className="mt-2">
                    <h2 id="notification-title" className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-4">{notification.title}</h2>
                    <div className="space-y-3 text-primary-700 dark:text-darkPrimary-300">
                        {notification.messages.map((msg, index) => (
                            <div key={index} className="flex items-center justify-center gap-2 text-base leading-relaxed">
                                {typeof msg === 'string' ? <p>{msg}</p> : msg}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    {notification.signature && (
                         <a
                            href={`https://solscan.io/tx/${notification.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-primary-300 dark:border-darkPrimary-600 text-primary-700 dark:text-darkPrimary-200 rounded-lg font-semibold hover:bg-primary-100 dark:hover:bg-darkPrimary-700 transition-colors"
                        >
                            <ExternalLink size={18} />
                            {t('view_on_solscan')}
                        </a>
                    )}
                    <button
                        onClick={hideNotification}
                        className="flex-1 w-full bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2.5 px-4 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
