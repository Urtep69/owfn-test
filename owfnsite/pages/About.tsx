

import React from 'react';
import { Link } from 'wouter';
import { HeartHandshake, BookOpen, HomeIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

export default function About() {
    const { t } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-text-primary" style={{ textShadow: '0 0 10px var(--neon-cyan)' }}>{t('about_title')}</h1>
                <p className="mt-4 text-lg text-text-secondary">
                    {t('about_subtitle')}
                </p>
            </div>

            <div className="p-8 glass-card">
                <h2 className="text-3xl font-bold mb-4">{t('about_mission_title')}</h2>
                <p className="text-text-secondary leading-relaxed">
                    {t('about_mission_desc')}
                </p>
            </div>

            <div className="p-8 glass-card">
                <h2 className="text-3xl font-bold mb-4">{t('about_vision_title')}</h2>
                <p className="text-text-secondary leading-relaxed">
                    {t('about_vision_desc')}
                </p>
            </div>
            
            <div>
                <h2 className="text-3xl font-bold text-center mb-8">{t('about_impact_areas_title')}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Link href="/impact/category/health">
                        <a className="block text-center p-6 glass-card hover:-translate-y-1 transition-all duration-300 cursor-pointer card-3d-hover">
                            <HeartHandshake className="mx-auto text-neon-cyan w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_health_title')}</h3>
                            <p className="text-text-secondary">{t('about_impact_health_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/education">
                         <a className="block text-center p-6 glass-card hover:-translate-y-1 transition-all duration-300 cursor-pointer card-3d-hover">
                            <BookOpen className="mx-auto text-neon-cyan w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_education_title')}</h3>
                            <p className="text-text-secondary">{t('about_impact_education_desc')}</p>
                        </a>
                    </Link>
                    <Link href="/impact/category/basic-needs">
                        <a className="block text-center p-6 glass-card hover:-translate-y-1 transition-all duration-300 cursor-pointer card-3d-hover">
                            <HomeIcon className="mx-auto text-neon-cyan w-12 h-12 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">{t('about_impact_needs_title')}</h3>
                            <p className="text-text-secondary">{t('about_impact_needs_desc')}</p>
                        </a>
                    </Link>
                </div>
            </div>
        </div>
    );
}