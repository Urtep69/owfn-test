

import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-surface p-6 rounded-xl shadow-lg hover:shadow-card-glow hover:scale-105 transition-all duration-300 transform border border-border">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-background rounded-full text-primary">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
        <p className="text-foreground-muted">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-16 animate-fade-in-up">
            <section className="text-center bg-gradient-to-br from-surface to-background rounded-3xl p-8 md:p-16 shadow-lg -mt-8 -mx-8 border border-border">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 bg-background/50 rounded-full w-48 h-48 p-3 shadow-lg backdrop-blur-sm border-2 border-border">
                        <img 
                            src={OWFN_LOGO_URL} 
                            alt="OWFN Logo" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tighter drop-shadow-lg">
                        {t('home_title')}
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-foreground-muted drop-shadow-md">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/presale" className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full text-lg hover:bg-primary/90 transition-transform transform hover:scale-105 shadow-lg">
                            {t('presale')}
                        </Link>
                        <Link to="/about" className="bg-transparent border-2 border-primary text-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-primary/20 transition-transform transform hover:scale-105">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 bg-surface/50 rounded-2xl border border-border">
                    <h2 className="text-3xl font-bold text-primary mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-foreground-muted">
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