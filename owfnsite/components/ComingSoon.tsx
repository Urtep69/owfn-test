import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Construction } from 'lucide-react';

export const ComingSoon = () => {
    const { t } = useAppContext();

    return (
        <div 
            className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-fade-in-up"
            style={{ animationDuration: '300ms' }}
            aria-live="polite"
        >
            <Construction className="w-16 h-16 text-primary mb-6" />
            <h2 className="text-4xl font-bold text-text-primary mb-2">
                {t('coming_soon_title')}
            </h2>
            <p className="text-lg text-text-secondary max-w-md text-center px-4">
                {t('coming_soon_desc')}
            </p>
        </div>
    );
};