import React from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { SocialCase } from '../types.ts';
import { ProgressBar } from './ProgressBar.tsx';
import { getFlagEmoji } from '../lib/utils.ts';

export const CaseCard = ({ socialCase }: { socialCase: SocialCase }) => {
    const { t, currentLanguage } = useAppContext();
    const progress = (socialCase.donated / socialCase.goal) * 100;
    
    const title = socialCase.title[currentLanguage.code] || socialCase.title['en'];
    const description = socialCase.description[currentLanguage.code] || socialCase.description['en'];

    return (
        <div className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-3d-lg">
            <div className="relative">
                <img src={socialCase.imageUrl} alt={title} className="w-full h-48 object-cover" />
                <span className="absolute top-3 right-3 text-3xl bg-black/20 backdrop-blur-sm rounded-md px-1" title={socialCase.countryCode}>
                    {getFlagEmoji(socialCase.countryCode)}
                </span>
            </div>
            <div className="p-6 flex-grow flex flex-col">
                <span className="text-sm font-semibold text-accent-600 dark:text-darkAccent-500 mb-1">{t(`category_${socialCase.category.toLowerCase().replace(/[\s&]+/g, '_')}`, { defaultValue: socialCase.category })}</span>
                <h3 className="text-xl font-bold mb-2 h-14">{title}</h3>
                <p className="text-primary-600 dark:text-darkPrimary-400 mb-4 flex-grow">{description.substring(0, 100)}...</p>
                <div className="space-y-2 mb-4">
                    <ProgressBar progress={progress} />
                    <div className="flex justify-between text-sm font-semibold">
                        <span>{t('funded')}: ${socialCase.donated.toLocaleString()}</span>
                        <span>{t('goal')}: ${socialCase.goal.toLocaleString()}</span>
                    </div>
                </div>
                <Link to={`/impact/case/${socialCase.id}`} className="mt-auto block w-full text-center bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors btn-tactile">
                    {t('view_case')}
                </Link>
            </div>
        </div>
    );
};
