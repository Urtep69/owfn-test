import React from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { SocialCase } from '../types.ts';
import { ProgressBar } from './ProgressBar.tsx';

export const CaseCard = ({ socialCase }: { socialCase: SocialCase }) => {
    const { t, currentLanguage } = useAppContext();
    const progress = (socialCase.donated / socialCase.goal) * 100;
    
    const title = socialCase.title[currentLanguage.code] || socialCase.title['en'];
    const description = socialCase.description[currentLanguage.code] || socialCase.description['en'];

    return (
        <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-primary-500/20 hover:-translate-y-1">
            <img src={socialCase.imageUrl} alt={title} className="w-full h-48 object-cover" />
            <div className="p-6 flex-grow flex flex-col">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-500 mb-1">{t(`category_${socialCase.category.toLowerCase().replace(' ', '_')}`, { defaultValue: socialCase.category })}</span>
                <h3 className="text-xl font-bold mb-2 h-14 text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4 flex-grow">{description.substring(0, 100)}...</p>
                <div className="space-y-2 mb-4">
                    <ProgressBar progress={progress} />
                    <div className="flex justify-between text-sm font-semibold">
                        <span>{t('funded')}: ${socialCase.donated.toLocaleString()}</span>
                        <span>{t('goal')}: ${socialCase.goal.toLocaleString()}</span>
                    </div>
                </div>
                <Link to={`/impact/case/${socialCase.id}`} className="mt-auto block w-full text-center bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    {t('view_case')}
                </Link>
            </div>
        </div>
    );
};