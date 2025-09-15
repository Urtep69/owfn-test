
import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';
import { OWFN_LOGO_URL } from '../lib/constants.js';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-surface/50 dark:bg-dark-surface p-6 rounded-xl shadow-glass border border-white/10 dark:border-dark-border backdrop-blur-lg hover:border-accent/50 dark:hover:border-dark-accent/50 hover:scale-105 transition-all duration-300 transform">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-accent/10 dark:bg-dark-accent/10 rounded-full text-accent dark:text-dark-accent">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-primary dark:text-dark-primary">{title}</h3>
        <p className="text-secondary dark:text-dark-secondary">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-16 animate-fade-in-up">
            <section className="text-center bg-surface/30 dark:bg-dark-surface/50 backdrop-blur-lg rounded-3xl p-8 md:p-16 border border-white/20 dark:border-dark-border -mt-8 -mx-8">
                <div className="relative z-10 flex flex-col items-center">
                     <div className="mb-6 bg-surface/20 dark:bg-dark-surface/20 rounded-full w-48 h-48 p-3 shadow-lg backdrop-blur-sm border-2 border-white/20 dark:border-dark-border">
                        <img 
                            src={OWFN_LOGO_URL} 
                            alt="OWFN Logo" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-primary dark:text-dark-primary leading-tight tracking-tighter drop-shadow-lg">
                        {t('home_title')}
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-secondary dark:text-dark-secondary drop-shadow-md">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/presale" className="bg-accent text-white dark:bg-dark-accent dark:text-dark-background font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-hover dark:hover:bg-dark-accent-hover transition-transform transform hover:scale-105 shadow-lg">
                            {t('presale')}
                        </Link>
                        <Link to="/about" className="bg-transparent border-2 border-accent dark:border-dark-accent text-accent dark:text-dark-accent font-bold py-3 px-8 rounded-full text-lg hover:bg-accent/20 dark:hover:bg-dark-accent/20 transition-transform transform hover:scale-105">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 bg-surface/30 dark:bg-dark-surface/50 backdrop-blur-md rounded-2xl border border-white/10 dark:border-dark-border">
                    <h2 className="text-3xl font-bold text-accent dark:text-dark-accent mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-primary dark:text-dark-secondary">
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