import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="glass-card p-8 text-center transform hover:-translate-y-2 transition-transform duration-300">
        <div className="flex items-center justify-center w-16 h-16 mb-6 bg-accent-500/10 dark:bg-accent-500/10 rounded-full text-accent-500 mx-auto">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-primary-900 dark:text-darkPrimary-100">{title}</h3>
        <p className="text-primary-600 dark:text-darkPrimary-400 leading-relaxed">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-24 animate-fade-in-up">
            <section className="text-center pt-16 pb-20">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 w-48 h-48 p-2 rounded-full glass-card">
                        <img 
                            src={OWFN_LOGO_URL} 
                            alt="OWFN Logo" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-primary-900 dark:text-white leading-tight tracking-tighter drop-shadow-lg">
                        {t('home_title')}
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-primary-700 dark:text-darkPrimary-200 drop-shadow-md">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6">
                        <Link to="/presale" className="bg-accent-500 text-white font-bold py-4 px-10 rounded-full text-lg neo-button border-accent-900/50 dark:border-accent-200/50">
                            {t('presale')}
                        </Link>
                        <Link to="/about" className="bg-primary-100 dark:bg-darkPrimary-800 text-primary-800 dark:text-darkPrimary-100 font-bold py-4 px-10 rounded-full text-lg neo-button">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-12 glass-card">
                    <h2 className="text-4xl font-bold text-primary-900 dark:text-darkPrimary-100 mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-primary-700 dark:text-darkPrimary-300 leading-loose">
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