import React from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { CaseCard } from '../components/CaseCard.tsx';
import { ArrowLeft, HeartHandshake, BookOpen, HomeIcon } from 'lucide-react';

const categoryDetails: { [key: string]: { icon: React.ReactNode, titleKey: string, descKey: string } } = {
    'Health': {
        icon: <HeartHandshake className="w-12 h-12 text-accent-400" />,
        titleKey: 'about_impact_health_title',
        descKey: 'about_impact_health_desc'
    },
    'Education': {
        icon: <BookOpen className="w-12 h-12 text-accent-500" />,
        titleKey: 'about_impact_education_title',
        descKey: 'about_impact_education_desc'
    },
    'Basic Needs': {
        icon: <HomeIcon className="w-12 h-12 text-accent-600" />,
        titleKey: 'about_impact_needs_title',
        descKey: 'about_impact_needs_desc'
    }
};

export default function ImpactCategory() {
    const { t, socialCases } = useAppContext();
    const params = useParams();
    // Normalize category name from URL to match data (e.g., 'basic-needs' -> 'Basic Needs')
    const categoryParam = params['category'];
    const categoryName = categoryParam
        ? categoryParam.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : '';
        
    const filteredCases = socialCases.filter(c => c.category === categoryName);
    const details = categoryDetails[categoryName];
    
    if (!details) {
        return (
            <div className="text-center py-10 animate-fade-in-up">
                <h2 className="text-2xl font-bold">Category Not Found</h2>
                <Link to="/impact" className="text-accent-500 hover:underline mt-4 inline-block">{t('back_to_all_cases')}</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            <Link to="/impact" className="inline-flex items-center gap-2 text-accent-400 hover:underline">
                <ArrowLeft size={16} /> {t('back_to_all_cases')}
            </Link>
            <div className="text-center p-8 bg-primary-800 rounded-lg shadow-3d">
                {details.icon}
                <h1 className="text-4xl font-bold text-accent-400 mt-4">{t(details.titleKey)}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-400">
                    {t(details.descKey)}
                </p>
            </div>
            
            {filteredCases.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCases.map(c => (
                        <CaseCard key={c.id} socialCase={c} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-12 bg-primary-800 rounded-lg shadow-inner-3d">
                    <p className="text-primary-400">No active cases in this category at the moment.</p>
                </div>
            )}
        </div>
    );
}