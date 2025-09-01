import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

interface ImpactNarrativeProps {
    userStats: {
        totalDonated: number;
        projectsSupported: number;
        votesCast: number;
    };
}

export const ImpactNarrative: React.FC<ImpactNarrativeProps> = ({ userStats }) => {
    const { t, currentLanguage } = useAppContext();
    const [narrative, setNarrative] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generateNarrative = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/narrative', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userStats, langName: currentLanguage.name }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setNarrative(data.narrative);
                } else {
                    setNarrative(t('api_error_generic'));
                }
            } catch (error) {
                console.error("Failed to fetch narrative:", error);
                setNarrative(t('api_error_generic'));
            } finally {
                setIsLoading(false);
            }
        };

        generateNarrative();
    }, [userStats, currentLanguage.name, t]);
    
    return (
        <div className="md:col-span-2 bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d flex flex-col justify-center">
            <h2 className="text-xl font-bold font-serif mb-3 flex items-center gap-2">
                <Sparkles className="text-accent-500 dark:text-darkAccent-400" />
                {t('impact_narrative_title')}
            </h2>
            {isLoading ? (
                <div className="flex items-center gap-3 text-primary-600 dark:text-darkPrimary-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t('impact_narrative_loading')}</span>
                </div>
            ) : (
                <div className="animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                    <p className="text-primary-700 dark:text-darkPrimary-300 font-serif text-lg leading-relaxed">
                        {narrative}
                    </p>
                    <p className="text-xs text-primary-500 dark:text-darkPrimary-500 mt-3 italic">
                        {t('generated_by_ai')}
                    </p>
                </div>
            )}
        </div>
    );
};