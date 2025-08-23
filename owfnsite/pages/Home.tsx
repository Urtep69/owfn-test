import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap, ArrowRight } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="glass-card p-8 text-center card-3d-hover">
        <div className="flex items-center justify-center w-16 h-16 mb-6 bg-neon-cyan/10 rounded-full text-neon-cyan mx-auto transition-transform duration-300 transform group-hover:scale-110">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-primary">{title}</h3>
        <p className="text-text-secondary leading-relaxed">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-32 animate-fade-in-up">
            <section className="text-center pt-16 pb-20 relative">
                <div className="absolute inset-0 -top-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan/10 via-transparent to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 w-48 h-48 p-2 rounded-full glass-card">
                        <img 
                            src={OWFN_LOGO_URL} 
                            alt="OWFN Logo" 
                            className="w-full h-full rounded-full object-cover animate-logo-pulse"
                        />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tighter" style={{ textShadow: '0 0 15px rgba(0, 255, 255, 0.5), 0 0 25px rgba(0, 255, 255, 0.3)'}}>
                        {t('home_title')}
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-text-primary">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6">
                        <Link to="/presale" className="font-bold py-4 px-10 rounded-full text-lg neon-button-magenta flex items-center gap-2">
                            {t('presale')} <ArrowRight size={20} />
                        </Link>
                        <Link to="/about" className="font-bold py-4 px-10 rounded-full text-lg neon-button">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-12 glass-card card-3d-hover">
                    <h2 className="text-4xl font-bold text-text-primary mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-text-secondary leading-loose">
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