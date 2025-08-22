

import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="glassmorphism p-8 rounded-2xl shadow-card hover:shadow-glow-md hover:-translate-y-2 transition-all duration-300 transform">
        <div className="flex items-center justify-center w-16 h-16 mb-6 bg-surface-2 rounded-full text-accent">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-primary">{title}</h3>
        <p className="text-text-secondary">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-24 animate-fade-in-up">
            <section className="text-center pt-16 md:pt-24">
                <div className="relative z-10 flex flex-col items-center">
                    <img 
                        src={OWFN_LOGO_URL} 
                        alt="OWFN Logo" 
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mb-6 border-4 border-surface-3 shadow-glow-lg"
                    />
                    <h1 className="text-5xl md:text-7xl font-display font-extrabold text-text-primary leading-tight tracking-tighter drop-shadow-lg">
                        {t('home_title')}
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-text-secondary drop-shadow-md">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/presale" className="bg-accent text-accent-foreground font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-hover transition-transform transform hover:scale-105 shadow-lg shadow-accent/20">
                            {t('presale')}
                        </Link>
                        <Link to="/about" className="bg-surface-2 border-2 border-border-color text-text-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-surface-3 hover:border-accent transition-all transform hover:scale-105">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 glassmorphism rounded-2xl">
                    <h2 className="text-3xl font-bold font-display text-accent mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-text-secondary">
                        {t('home_message')}
                    </p>
                </div>
            </section>
            
            <section className="container mx-auto pb-16">
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