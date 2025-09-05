import React from 'react';
import { Link } from 'wouter';
import { Target } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { SocialCase } from '../types.ts';
import { ProgressBar } from './ProgressBar.tsx';

interface CaseCardProps {
    socialCase: SocialCase;
}

export const CaseCard: React.FC<CaseCardProps> = ({ socialCase }) => {
    const { t, currentLanguage } = useAppContext();
    const progress = (socialCase.fundedUSD / socialCase.goalUSD) * 100;
    
    const title = socialCase.title[currentLanguage.code] || socialCase.title['en'];
    const description = socialCase.description[currentLanguage.code] || socialCase.description['en'];

    return (
        <div className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d overflow-hidden flex flex-col transition-transform transform hover:-translate-y-1">
            <img src={socialCase.imageUrl} alt={title} className="w-full h-48 object-cover"/>
            <div className="p-6 flex-grow flex flex-col">
                <span className="text-sm font-semibold text-accent-600 dark:text-darkAccent-400 uppercase">{t(`category_${socialCase.category}`)}</span>
                <h3 className="text-xl font-bold mt-2 mb-2">{title}</h3>
                <p className="text-primary-600 dark:text-darkPrimary-400 text-sm mb-4 flex-grow">{description}</p>
                <div className="space-y-2 mt-auto">
                     <div className="flex justify-between items-end">
                        <div>
                            <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('funded')}</p>
                            <p className="font-bold text-lg text-primary-900 dark:text-darkPrimary-100">${socialCase.fundedUSD.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('goal')}</p>
                             <p className="font-semibold text-primary-700 dark:text-darkPrimary-300">${socialCase.goalUSD.toLocaleString()}</p>
                        </div>
                    </div>
                    <ProgressBar progress={progress}/>
                    <Link to={`/impact/case/${socialCase.id}`} className="block mt-4 text-center bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2 px-4 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors">
                        {t('view_case')}
                    </Link>
                </div>
            </div>
        </div>
    );
};
