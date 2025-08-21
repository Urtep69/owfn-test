


import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-primary-50 dark:bg-darkPrimary-800 p-6 rounded-xl shadow-neo-brutal dark:shadow-dark-neo-brutal border-2 border-primary-900 dark:border-primary-100 transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary-200 dark:bg-darkPrimary-700 rounded-lg text-accent-500 border-2 border-primary-900 dark:border-primary-100">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-primary-900 dark:text-primary-100">{title}</h3>
        <p className="text-primary-600 dark:text-primary-400">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-20 animate-fade-in-up">
            <section className="text-center bg-primary-100 dark:bg-darkPrimary-800 rounded-2xl p-8 md:p-12 border-2 border-primary-900 dark:border-primary-100 shadow-neo-brutal dark:shadow-dark-neo-brutal -mt-8 -mx-4 sm:-mx-8">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 w-48 h-48 animate-float">
                         <div className="relative w-full h-full p-3 bg-primary-100/50 dark:bg-darkPrimary-900/50 rounded-full backdrop-blur-sm border-2 border-primary-900/30 dark:border-primary-100/30 shadow-lg">
                            <img 
                                src={OWFN_LOGO_URL} 
                                alt="OWFN Logo" 
                                className="w-full h-full rounded-full object-cover"
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-primary-900 dark:text-white leading-tight tracking-tighter">
                        {t('home_title')}
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-primary-700 dark:text-primary-200">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link 
                            to="/presale" 
                            className="bg-accent-500 text-white font-bold py-3 px-8 rounded-lg border-2 border-primary-900 dark:border-primary-100 shadow-neo-brutal dark:shadow-dark-neo-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none transition-transform"
                        >
                            {t('presale')}
                        </Link>
                        <Link 
                            to="/about" 
                            className="bg-primary-50 text-primary-900 dark:bg-darkPrimary-800 dark:text-primary-100 font-bold py-3 px-8 rounded-lg border-2 border-primary-900 dark:border-primary-100 shadow-neo-brutal dark:shadow-dark-neo-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none transition-transform"
                        >
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                 <div className="text-center p-8 bg-primary-100/50 dark:bg-darkPrimary-800/50 rounded-2xl border-2 border-primary-900 dark:border-primary-100 shadow-neo-brutal dark:shadow-dark-neo-brutal">
                    <h2 className="text-3xl font-bold text-accent-600 dark:text-darkAccent-500 mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-primary-700 dark:text-primary-300">
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