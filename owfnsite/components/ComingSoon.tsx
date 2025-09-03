import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Construction } from 'lucide-react';

export const ComingSoon = () => {
    const { t } = useAppContext();

    return (
        <div 
            className="absolute inset-0 bg-primary-100/60 dark:bg-darkPrimary-900/60 flex flex-col items-center justify-center z-10 animate-fade-in-up"
            style={{ animationDuration: '300ms' }}
            aria-live="polite"
        >
            <Construction className="w-16 h-16 text-accent-500 dark:text-darkAccent-400 mb-6" />
            <h2 className="text-4xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-2">
                {t('coming_soon_title')}
            </h2>
            <p className="text-lg text-primary-700 dark:text-darkPrimary-300 max-w-md text-center px-4">
                {t('coming_soon_desc')}
            </p>
        </div>
    );
};