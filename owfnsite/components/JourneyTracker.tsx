import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { getCompletedActions, ALL_JOURNEY_ITEMS } from '../lib/journeyManager.js';
import type { JourneyAction } from '../lib/types.js';
import { CheckCircle2 } from 'lucide-react';

export const JourneyTracker = () => {
    const { t } = useAppContext();
    const [completed, setCompleted] = useState<Set<JourneyAction>>(new Set());

    useEffect(() => {
        const completedActions = getCompletedActions();
        setCompleted(new Set(completedActions));
        
        const handleStorageChange = () => {
            setCompleted(new Set(getCompletedActions()));
        };

        window.addEventListener('journeyActionCompleted', handleStorageChange);
        return () => window.removeEventListener('journeyActionCompleted', handleStorageChange);

    }, []);

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d">
            <h2 className="text-2xl font-bold mb-4">{t('journey_tracker_title')}</h2>
            <p className="text-sm text-primary-600 dark:text-darkPrimary-400 mb-6">{t('journey_tracker_subtitle')}</p>
            <ul className="space-y-4">
                {ALL_JOURNEY_ITEMS.map(item => {
                    const isCompleted = completed.has(item.id);
                    return (
                        <li key={item.id} className="flex items-center gap-4">
                            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-primary-200 dark:bg-darkPrimary-700'}`}>
                                {isCompleted && (
                                    <CheckCircle2 className="w-5 h-5 text-white animate-fade-in-up" style={{animationDuration: '500ms'}} />
                                )}
                            </div>
                            <span className={`font-semibold transition-colors ${isCompleted ? 'text-primary-800 dark:text-darkPrimary-200' : 'text-primary-500 dark:text-darkPrimary-500'}`}>
                                {t(item.titleKey)}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
