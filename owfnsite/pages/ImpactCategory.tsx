import React from 'react';
import { Link, useParams, Redirect } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { CaseCard } from '../components/CaseCard.tsx';
import { ArrowLeft } from 'lucide-react';

export default function ImpactCategory() {
    const { t, socialCases } = useAppContext();
    const params = useParams();
    const category = params?.category as 'health' | 'education' | 'basic-needs' | undefined;

    if (!category || !['health', 'education', 'basic-needs'].includes(category)) {
        return <Redirect to="/impact" />;
    }

    const filteredCases = socialCases.filter(c => c.category === category);
    
    return (
        <div className="animate-fade-in-up space-y-8">
             <Link to="/impact" className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline mb-4">
                <ArrowLeft size={16} /> {t('back_to_all_cases')}
            </Link>
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t(`category_${category}`)}</h1>
            </div>

            {filteredCases.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCases.map(c => <CaseCard key={c.id} socialCase={c} />)}
                </div>
            ) : (
                 <div className="text-center py-16 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-inner">
                    <p className="text-lg text-primary-600 dark:text-darkPrimary-400">{t('no_active_cases_in_category')}</p>
                </div>
            )}
        </div>
    );
}
