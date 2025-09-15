import React from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import type { SocialCase } from '../lib/types.js';
import { ProgressBar } from './ProgressBar.js';

export const CaseCard = ({ socialCase }: { socialCase: SocialCase }) => {
    const { t, currentLanguage } = useAppContext();
    const progress = (socialCase.donated / socialCase.goal) * 100;
    
    const title = socialCase.title[currentLanguage.code] || socialCase.title['en'];
    const description = socialCase.description[currentLanguage.code] || socialCase.description['en'];

    return (
        <div className="bg-dextools-card border border-dextools-border rounded-md overflow-hidden flex flex-col transition-all duration-300 hover:border-dextools-accent-blue">
            <img src={socialCase.imageUrl} alt={title} className="w-full h-48 object-cover" />
            <div className="p-6 flex-grow flex flex-col">
                <span className="text-sm font-semibold text-dextools-accent-blue mb-1">{t(`category_${socialCase.category.toLowerCase().replace(' ', '_')}`, { defaultValue: socialCase.category })}</span>
                <h3 className="text-xl font-bold mb-2 h-14 text-dextools-text-primary">{title}</h3>
                <p className="text-dextools-text-secondary mb-4 flex-grow">{description.substring(0, 100)}...</p>
                <div className="space-y-2 mb-4">
                    <ProgressBar progress={progress} />
                    <div className="flex justify-between text-sm font-semibold text-dextools-text-primary">
                        <span>{t('funded')}: ${socialCase.donated.toLocaleString()}</span>
                        <span className="text-dextools-text-secondary">{t('goal')}: ${socialCase.goal.toLocaleString()}</span>
                    </div>
                </div>
                <Link to={`/impact/case/${socialCase.id}`} className="mt-auto block w-full text-center bg-dextools-special text-white font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">
                    {t('view_case')}
                </Link>
            </div>
        </div>
    );
};