import React from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';
import { CommunityToolkit } from '../components/CommunityToolkit.tsx';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-sm p-6 rounded-xl shadow-3d hover:shadow-3d-lg transition-all duration-300 group perspective-1000">
        <div 
            className="transform-style-3d transition-transform duration-500 group-hover:rotate-x-[10deg] group-hover:-translate-y-2"
            style={{ transform: 'translateZ(20px)'}}
        >
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary-100 dark:bg-darkPrimary-700 rounded-full text-accent-500 dark:text-darkAccent-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-100 dark:group-hover:bg-darkAccent-900">
                {icon}
            </div>
            <h3 
                className="mb-2 text-xl font-bold font-serif text-primary-900 dark:text-darkPrimary-100 transition-transform duration-500 group-hover:translate-z-1"
                style={{ transform: 'translateZ(30px)'}}
            >
                {title}
            </h3>
            <p className="text-primary-600 dark:text-darkPrimary-300">{children}</p>
        </div>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-16 animate-fade-in-up">
            <section className="text-center bg-gradient-to-br from-primary-50 to-primary-200 dark:from-darkPrimary-900 dark:to-darkPrimary-950 rounded-3xl p-8 md:p-16 shadow-3d-lg -mt-8 -mx-8 aurora-bg">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 bg-white/20 dark:bg-darkPrimary-950/20 rounded-full w-48 h-48 p-3 shadow-lg backdrop-blur-sm border-2 border-primary-300/30 dark:border-darkPrimary-100/30">
                        <img 
                            src={OWFN_LOGO_URL} 
                            alt="OWFN Logo" 
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-primary-900 dark:text-white leading-tight tracking-tighter drop-shadow-lg font-serif">
                        {t('home_title')}
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-primary-700 dark:text-darkPrimary-200 drop-shadow-md">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/presale" className="bg-gradient-to-br from-accent-400 to-accent-500 text-accent-950 dark:from-darkAccent-400 dark:to-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-8 rounded-full text-lg hover:shadow-3d-lg transition-all transform hover:-translate-y-0.5 shadow-3d btn-tactile">
                            {t('presale')}
                        </Link>
                        <Link to="/about" className="bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-sm border-2 border-accent-400 text-accent-500 dark:border-darkAccent-500 dark:text-darkAccent-500 font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-400/20 dark:hover:bg-darkAccent-500/20 transition-all transform hover:-translate-y-0.5 shadow-3d hover:shadow-3d-lg btn-tactile">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 bg-primary-50/50 dark:bg-darkPrimary-800/50 rounded-2xl shadow-3d">
                    <h2 className="text-3xl font-bold font-serif text-accent-500 dark:text-darkAccent-400 mb-4">{t('core_message_title')}</h2>
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

            <CommunityToolkit />

        </div>
    );
}