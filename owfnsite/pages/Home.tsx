


import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-primary-500/20 transition-all duration-300 transform hover:-translate-y-2">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary-500/10 dark:bg-primary-500/10 rounded-xl text-primary-500 dark:text-primary-400">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-16 animate-fade-in-up">
            <section className="text-center bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-2xl rounded-3xl p-8 md:p-16 border border-slate-300/80 dark:border-slate-700/80">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 bg-white/20 dark:bg-slate-900/20 rounded-full w-48 h-48 p-3 shadow-lg backdrop-blur-sm border border-slate-300/30 dark:border-slate-100/10">
                        <img 
                            src={OWFN_LOGO_URL} 
                            alt="OWFN Logo" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tighter drop-shadow-lg">
                        {t('home_title')}
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-slate-700 dark:text-slate-200 drop-shadow-md">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/presale" className="bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-md hover:shadow-glow-primary">
                            {t('presale')}
                        </Link>
                        <Link to="/about" className="bg-transparent border-2 border-primary-500 text-primary-500 font-semibold py-3 px-8 rounded-lg hover:bg-primary-500/10 transition-all transform hover:scale-105">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h2 className="text-3xl font-bold text-primary-500 dark:text-primary-400 mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-slate-700 dark:text-slate-300">
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