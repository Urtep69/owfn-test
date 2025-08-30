import React from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { HeartHandshake, BookOpen, HomeIcon, Loader2 } from 'lucide-react';
import { CaseCard } from '../components/CaseCard.tsx';

export default function ImpactPortal() {
    const { t, solana, socialCases, addSocialCase, isLoadingData } = useAppContext();
    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;
    
    const categories = [
        { 
            name: 'Health',
            icon: <HeartHandshake className="mx-auto text-accent-500 dark:text-darkAccent-400 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_health_title',
            descKey: 'about_impact_health_desc',
        },
        { 
            name: 'Education',
            icon: <BookOpen className="mx-auto text-accent-500 dark:text-darkAccent-500 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_education_title',
            descKey: 'about_impact_education_desc',
        },
        { 
            name: 'Basic Needs',
            icon: <HomeIcon className="mx-auto text-accent-600 dark:text-darkAccent-600 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_needs_title',
            descKey: 'about_impact_needs_desc',
        }
    ];

    // Admin functionality is not part of this implementation stage yet
    // but the component structure remains for future use.
    // const AdminPortal = ({ onAddCase }: { onAddCase: (newCase: SocialCase) => void }) => { ... };

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('about_impact_areas_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('social_cases_desc')}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {categories.map(category => (
                    <Link 
                        key={category.name}
                        href={`/impact/category/${category.name.toLowerCase().replace(' ', '-')}`}
                    >
                       <a className="block text-center p-8 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent-500">
                            {category.icon}
                            <h2 className="text-2xl font-bold">{t(category.titleKey)}</h2>
                            <p className="text-primary-600 dark:text-darkPrimary-400 mt-2">{t(category.descKey)}</p>
                       </a>
                    </Link>
                ))}
            </div>

            <div>
                <h2 className="text-3xl font-bold text-center mb-8">{t('social_cases')}</h2>
                {isLoadingData ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
                    </div>
                ) : socialCases.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {socialCases.map(c => (
                            <CaseCard key={c.id} socialCase={c} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-inner-3d">
                        <p className="text-primary-600 dark:text-darkPrimary-400">{t('no_active_cases_in_category')}</p>
                    </div>
                )}
            </div>
            
            {/* The admin portal form is hidden for now as per the implementation plan */}
            {/* {isAdmin && <AdminPortal onAddCase={addSocialCase} />} */}
        </div>
    );
}