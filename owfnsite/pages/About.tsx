

import React from 'react';
import { Link } from 'wouter';
import { HeartHandshake, BookOpen, HomeIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { owfnImpactCollage } from '../lib/assets.ts';

export default function About() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('about_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('about_subtitle')}
                </p>
            </div>

            <section className="my-12">
                <div className="relative group max-w-4xl mx-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent-400/80 to-accent-600/80 rounded-2xl blur-xl opacity-20 dark:opacity-40 group-hover:opacity-30 dark:group-hover:opacity-50 transition duration-500 animate-pulse-slow"></div>
                    <div className="relative bg-white dark:bg-darkPrimary-800 ring-1 ring-primary-900/5 dark:ring-white/10 rounded-2xl p-2 shadow-3d-lg">
                        <img 
                            src={owfnImpactCollage} 
                            alt={t('about_owfn_collage_alt')} 
                            className="w-full h-auto object-contain rounded-xl" 
                        />
                    </div>
                </div>
            </section>

            <div className="p-8 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
                <h2 className="text-3xl font-bold mb-4">{t('about_mission_title')}</h2>
                <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">
                    {t('about_mission_desc')}
                </p>
            </div>

            <div className="p-8 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d">
                <h2 className="text-3xl font-bold mb-4">{t('about_vision_title')}</h2>
                <p className="text-primary-700 dark:text-darkPrimary-300 leading-relaxed">
                    {t('about_vision_desc')}
                </p>
            </div>
            
            <div>
                <h2 className="text-3xl font-bold text-center mb-8">{t('about_impact_areas_title')}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Link href="/impact/category/health">
                        <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <HeartHandshake className="mx-auto text-accent-500 dark:text-darkAccent-400 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_health_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_health_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/education">
                         <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <BookOpen className="mx-auto text-accent-500 dark:text-darkAccent-500 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_education_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_education_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/basic-needs">
                        <a className="block text-center p-6 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d hover:shadow-3d-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <HomeIcon className="mx-auto text-accent-600 dark:text-darkAccent-600 w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_needs_title')}</h3>
                            <p className="text-primary-600 dark:text-darkPrimary-400">{t('about_impact_needs_desc')}</p>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
}