import React from 'react';
import { useParams, Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { CaseCard } from '../components/CaseCard.js';
import { ArrowLeft, HeartHandshake, BookOpen, HomeIcon } from 'lucide-react';

const categoryDetails: { [key: string]: { icon: React.ReactNode, titleKey: string, descKey: string } } = {
    'Health': { icon: <HeartHandshake className="w-12 h-12 text-dextools-accent-blue" />, titleKey: 'about_impact_health_title', descKey: 'about_impact_health_desc' },
    'Education': { icon: <BookOpen className="w-12 h-12 text-dextools-accent-blue" />, titleKey: 'about_impact_education_title', descKey: 'about_impact_education_desc' },
    'Basic Needs': { icon: <HomeIcon className="w-12 h-12 text-dextools-accent-blue" />, titleKey: 'about_impact_needs_title', descKey: 'about_impact_needs_desc' }
};

export default function ImpactCategory() {
    const { t, socialCases } = useAppContext();
    const params = useParams();
    const categoryParam = params['category'];
    const categoryName = categoryParam ? categoryParam.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
    const filteredCases = socialCases.filter(c => c.category === categoryName);
    const details = categoryDetails[categoryName];
    
    if (!details) {
        return (
            <div className="text-center py-10 animate-fade-in">
                <h2 className="text-2xl font-bold text-dextools-text-primary">Category Not Found</h2>
                <Link to="/impact" className="text-dextools-accent-blue hover:underline mt-4 inline-block">{t('back_to_all_cases')}</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            <Link to="/impact" className="inline-flex items-center gap-2 text-dextools-accent-blue hover:underline">
                <ArrowLeft size={16} /> {t('back_to_all_cases')}
            </Link>
            <div className="text-center p-8 bg-dextools-card border border-dextools-border rounded-md">
                {details.icon}
                <h1 className="text-4xl font-bold text-dextools-accent-blue mt-4">{t(details.titleKey)}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-dextools-text-secondary">
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
                <div className="text-center p-12 bg-dextools-card border border-dextools-border rounded-md">
                    <p className="text-dextools-text-secondary">{t('no_active_cases_in_category')}</p>
                </div>
            )}
        </div>
    );
}