import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { CaseCard } from '../components/CaseCard.tsx';
import { ArrowLeft, HeartHandshake, BookOpen, HomeIcon } from 'lucide-react';
import type { SocialCase } from '../types.ts';

const categoryDetails: { [key: string]: { icon: React.ReactNode, titleKey: string, descKey: string } } = {
    'Health': {
        icon: <HeartHandshake className="w-12 h-12 text-accent-500 dark:text-darkAccent-400" />,
        titleKey: 'about_impact_health_title',
        descKey: 'about_impact_health_desc'
    },
    'Education': {
        icon: <BookOpen className="w-12 h-12 text-accent-500 dark:text-darkAccent-500" />,
        titleKey: 'about_impact_education_title',
        descKey: 'about_impact_education_desc'
    },
    'Basic Needs': {
        icon: <HomeIcon className="w-12 h-12 text-accent-600 dark:text-darkAccent-600" />,
        titleKey: 'about_impact_needs_title',
        descKey: 'about_impact_needs_desc'
    }
};

type StatusFilter = 'all' | SocialCase['status'];

export default function ImpactCategory() {
    const { t, socialCases } = useAppContext();
    const params = useParams();
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    
    const categoryParam = params['category'];
    const categoryName = categoryParam
        ? categoryParam.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : '';
        
    const details = categoryDetails[categoryName];

    const filteredCases = useMemo(() => {
        return socialCases.filter(c => {
            const isInCategory = c.category === categoryName;
            const isInStatus = statusFilter === 'all' || c.status === statusFilter;
            return isInCategory && isInStatus;
        });
    }, [socialCases, categoryName, statusFilter]);

    if (!details) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">Category Not Found</h2>
                <Link to="/impact" className="text-accent-500 dark:text-darkAccent-500 hover:underline mt-4 inline-block">{t('back_to_all_cases')}</Link>
            </div>
        );
    }
    
    const filterOptions: { key: StatusFilter, nameKey: string }[] = [
        { key: 'all', nameKey: 'filter_status_all' },
        { key: 'ongoing', nameKey: 'filter_status_ongoing' },
        { key: 'future', nameKey: 'filter_status_future' },
        { key: 'completed', nameKey: 'filter_status_completed' },
    ];

    return (
        <div className="animate-fade-in-up space-y-8">
            <Link to="/impact" className="inline-flex items-center gap-2 text-accent-600 dark:text-darkAccent-400 hover:underline">
                <ArrowLeft size={16} /> {t('back_to_all_cases')}
            </Link>
            <div className="text-center p-8 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
                {details.icon}
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400 mt-4">{t(details.titleKey)}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t(details.descKey)}
                </p>
            </div>
            
            <div className="bg-white/50 dark:bg-darkPrimary-800/50 p-4 rounded-lg shadow-inner-3d flex flex-wrap items-center justify-center gap-3">
                 {filterOptions.map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setStatusFilter(opt.key)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                            statusFilter === opt.key
                                ? 'bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 shadow-md'
                                : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-darkPrimary-700 dark:text-darkPrimary-300 dark:hover:bg-darkPrimary-600'
                        }`}
                    >
                        {t(opt.nameKey)}
                    </button>
                ))}
            </div>

            {filteredCases.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCases.map(c => (
                        <CaseCard key={c.id} socialCase={c} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-inner-3d">
                    <p className="text-primary-600 dark:text-darkPrimary-400">{t('no_active_cases_in_category')}</p>
                </div>
            )}
        </div>
    );
}