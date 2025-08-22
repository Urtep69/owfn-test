

import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-xl shadow-3d hover:shadow-3d-lg hover:scale-105 transition-all duration-300 transform">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary-100 dark:bg-darkPrimary-700 rounded-full text-accent-500 dark:text-darkAccent-400">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-primary-900 dark:text-darkPrimary-100">{title}</h3>
        <p className="text-primary-600 dark:text-darkPrimary-400">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-16 animate-fade-in-up">
            <section className="text-center bg-gradient-to-br from-white to-primary-200 dark:from-darkPrimary-800 dark:to-darkPrimary-950 rounded-3xl p-8 md:p-16 shadow-3d-lg -mt-8 -mx-8">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 bg-white/20 dark:bg-darkPrimary-950/20 rounded-full w-48 h-48 p-3 shadow-lg backdrop-blur-sm border-2 border-primary-300/30 dark:border-darkPrimary-100/30">
                        <img 
                            src={OWFN_LOGO_URL} 
                            alt="OWFN Logo" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-primary-900 dark:text-white leading-tight tracking-tighter drop-shadow-lg">
                        {t('home_title')}
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-primary-700 dark:text-darkPrimary-200 drop-shadow-md">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/presale" className="bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-transform transform hover:scale-105 shadow-lg">
                            {t('presale')}
                        </Link>
                        <Link to="/about" className="bg-transparent border-2 border-accent-400 text-accent-500 dark:border-darkAccent-500 dark:text-darkAccent-500 font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-400/20 dark:hover:bg-darkAccent-500/20 transition-transform transform hover:scale-105">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 bg-primary-50/50 dark:bg-darkPrimary-800/50 rounded-2xl">
                    <h2 className="text-3xl font-bold text-accent-500 dark:text-darkAccent-400 mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-primary-700 dark:text-darkPrimary-300">
                        {t('home_message')}
                    </p>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard icon={<Target size={32} />} title={t('home_feature_impact_title')}>
                        {t('home_feature_impact_desc')}
                    </FeatureCard>
                    <FeatureCard icon={<Users size={32} />} title={t('home_feature_community_title')}>
                        {t('home_feature_community_desc')}
                    </FeatureCard>
                    <FeatureCard icon={<Zap size={32} />} title={t('home_feature_solana_title')}>
                        {t('home_feature_solana_desc')}
                    </FeatureCard>
                </div>
            </section>
        </div>
    );
}