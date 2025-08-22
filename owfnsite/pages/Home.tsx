import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap, ArrowRight } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="glassmorphism p-8 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 transform">
        <div className="flex items-center justify-center w-16 h-16 mb-6 bg-surface-dark rounded-full bg-gradient-to-br from-accent/10 to-accent-light/10 text-accent-light">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-primary font-display">{title}</h3>
        <p className="text-text-secondary">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-24 animate-fade-in-up">
            <section className="relative text-center min-h-[80vh] flex flex-col justify-center items-center overflow-hidden -mt-16">
                {/* Spline 3D Object as the background centerpiece */}
                <div className="absolute inset-0 z-0">
                     <spline-viewer
                        url="https://prod.spline.design/iW4E-W-L3b7T3bGr/scene.splinecode"
                        events-target="global"
                    ></spline-viewer>
                </div>
                
                <div className="relative z-10 flex flex-col items-center p-4">
                    <h1 className="text-5xl md:text-7xl font-display font-extrabold text-text-primary leading-tight tracking-tighter drop-shadow-lg">
                        {t('home_title')}
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-text-secondary drop-shadow-sm">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/presale" className="group text-white bg-gradient-to-r from-accent to-accent-light font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg hover:shadow-glow-accent flex items-center gap-2">
                            <span>{t('presale')}</span>
                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link to="/about" className="bg-surface border-2 border-border-color text-text-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-surface-dark hover:border-accent-light transition-all transform hover:scale-105 shadow-card">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 glassmorphism rounded-2xl">
                    <h2 className="text-3xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-text-secondary">
                        {t('home_message')}
                    </p>
                </div>
            </section>
            
            <section className="container mx-auto pb-16">
                 <div className="text-center mb-12">
                     <h2 className="text-4xl font-display font-bold text-text-primary">A Global Vision</h2>
                </div>
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