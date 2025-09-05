import React from 'react';
import { Link, useParams, Redirect } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ArrowLeft, Clock, Target, CheckCircle } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { NftReward } from '../components/NftReward.tsx';

export default function ImpactCaseDetail() {
    const { t, socialCases, currentLanguage } = useAppContext();
    const params = useParams();
    const caseId = params?.id;
    const socialCase = socialCases.find(c => c.id === caseId);

    if (!socialCase) {
        return <Redirect to="/impact" />;
    }
    
    const title = socialCase.title[currentLanguage.code] || socialCase.title['en'];
    const description = socialCase.description[currentLanguage.code] || socialCase.description['en'];
    const details = socialCase.details[currentLanguage.code] || socialCase.details['en'];
    const progress = (socialCase.fundedUSD / socialCase.goalUSD) * 100;

    const milestones = [
        { progress: 25, key: 'milestone_25'},
        { progress: 50, key: 'milestone_50'},
        { progress: 75, key: 'milestone_75'},
        { progress: 100, key: 'milestone_100'},
    ];

    return (
        <div className="animate-fade-in-up space-y-8">
            <Link to="/impact" className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {t('back_to_all_cases')}
            </Link>

            <div className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d overflow-hidden">
                <img src={socialCase.imageUrl} alt={title} className="w-full h-64 object-cover"/>
                <div className="p-8">
                    <span className="text-sm font-semibold text-accent-600 dark:text-darkAccent-400 uppercase">{t(`category_${socialCase.category}`)}</span>
                    <h1 className="text-3xl font-bold mt-2">{title}</h1>
                    <p className="mt-4 text-lg text-primary-700 dark:text-darkPrimary-300">{description}</p>
                </div>
                <div className="p-8 border-t border-primary-200 dark:border-darkPrimary-700">
                    <h2 className="text-2xl font-bold mb-4">{t('case_details_title')}</h2>
                    <p className="text-primary-600 dark:text-darkPrimary-400 whitespace-pre-wrap">{details}</p>
                </div>

                <div className="p-8 bg-primary-50 dark:bg-darkPrimary-800/50">
                    <div className="flex justify-between items-end mb-2">
                        <p><span className="font-bold text-2xl">${socialCase.fundedUSD.toLocaleString()}</span> <span className="text-primary-600 dark:text-darkPrimary-400">raised of ${socialCase.goalUSD.toLocaleString()}</span></p>
                    </div>
                    <ProgressBar progress={progress}/>
                    <Link to={`/donations?case=${socialCase.id}`} className="block mt-6 text-center w-full bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors">
                        {t('support_this_cause')}
                    </Link>
                    <NftReward caseTitle={title} donationAmountUsd={socialCase.fundedUSD} />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Clock size={24}/>{t('live_updates')}</h2>
                    <div className="space-y-4">
                        <p className="text-primary-700 dark:text-darkPrimary-300">{t('case_update_1')}</p>
                        <p className="text-primary-700 dark:text-darkPrimary-300 border-t border-primary-200 dark:border-darkPrimary-700 pt-4">{t('case_update_2')}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Target size={24}/>{t('funding_milestones')}</h2>
                    <ul className="space-y-3">
                        {milestones.map(m => (
                             <li key={m.key} className={`flex items-start gap-3 ${progress >= m.progress ? 'text-green-600 dark:text-green-400' : 'text-primary-500 dark:text-darkPrimary-500'}`}>
                                <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${progress >= m.progress ? '' : 'opacity-50'}`} />
                                <span><strong>{m.progress}%:</strong> {t(m.key)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
