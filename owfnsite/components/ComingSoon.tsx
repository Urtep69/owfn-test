import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Construction } from 'lucide-react';

export const ComingSoon = () => {
    const { t } = useAppContext();

    return (
        <div 
            className="absolute inset-0 bg-primary-100/30 dark:bg-darkPrimary-950/30 backdrop-blur-md flex items-center justify-center z-10 p-4"
            aria-live="polite"
        >
            <div className="bg-white/50 dark:bg-darkPrimary-800/50 p-8 rounded-2xl shadow-3d-lg text-center max-w-md w-full animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                <Construction className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-400 mb-6" />
                <h2 className="text-3xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-2">
                    {t('coming_soon_title')}
                </h2>
                <p className="text-lg text-primary-700 dark:text-darkPrimary-300">
                    {t('coming_soon_desc')}
                </p>
            </div>
        </div>
    );
};
