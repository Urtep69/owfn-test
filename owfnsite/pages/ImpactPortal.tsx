
import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { HeartHandshake, BookOpen, HomeIcon, Loader2 } from 'lucide-react';

export default function ImpactPortal() {
    const { t, socialCases, isDataLoading } = useAppContext();
    
    const categories = [
        { 
            name: 'Health',
            icon: <HeartHandshake className="mx-auto text-accent-500 dark:text-darkAccent-400 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_health_title',
            descKey: 'about_impact_health_desc',
            casesCount: socialCases.filter(c => c.category === 'Health').length
        },
        { 
            name: 'Education',
            icon: <BookOpen className="mx-auto text-accent-500 dark:text-darkAccent-500 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_education_title',
            descKey: 'about_impact_education_desc',
            casesCount: socialCases.filter(c => c.category === 'Education').length
        },
        { 
            name: 'Basic Needs',
            icon: <HomeIcon className="mx-auto text-accent-600 dark:text-darkAccent-600 w-12 h-12 mb-4" />,
            titleKey: 'about_impact_needs_title',
            descKey: 'about_impact_needs_desc',
            casesCount: socialCases.filter(c => c.category === 'Basic Needs').length
        }
    ];

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('about_impact_areas_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('social_cases_desc')}
                </p>
            </div>

            {isDataLoading ? (
                 <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-accent-500" />
                </div>
            ) : (
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
            )}
        </div>
    );
}
