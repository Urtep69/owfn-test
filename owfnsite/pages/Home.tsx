import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-surface border border-border p-6 rounded-lg transition-transform hover:-translate-y-1">
        <div className="flex items-center justify-center w-12 h-12 mb-4 bg-background rounded-lg text-primary">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-primary">{title}</h3>
        <p className="text-text-secondary">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-16 animate-fade-in-up">
            <section className="text-center py-16">
                 <img 
                    src={OWFN_LOGO_URL} 
                    alt="OWFN Logo" 
                    className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-surface"
                />
                <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-tight tracking-tighter">
                    {t('home_title')}
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-text-secondary">
                    {t('home_subtitle')}
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link to="/presale" className="bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-colors transform hover:scale-105 shadow-glow-primary">
                        {t('presale')}
                    </Link>
                    <Link to="/about" className="bg-surface border-2 border-border text-text-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-border transition-colors transform hover:scale-105">
                        {t('about')}
                    </Link>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 bg-surface/50 rounded-2xl border border-border">
                    <h2 className="text-3xl font-bold text-primary mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-text-secondary">
                        {t('home_message')}
                    </p>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard icon={<Target size={28} />} title={t('home_feature_impact_title')}>
                        {t('home_feature_impact_desc')}
                    </FeatureCard>
                    <FeatureCard icon={<Users size={28} />} title={t('home_feature_community_title')}>
                        {t('home_feature_community_desc')}
                    </FeatureCard>
                    <FeatureCard icon={<Zap size={28} />} title={t('home_feature_solana_title')}>
                        {t('home_feature_solana_desc')}
                    </FeatureCard>
                </div>
            </section>
        </div>
    );
}