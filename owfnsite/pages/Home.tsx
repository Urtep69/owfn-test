import React, { useRef } from 'react';
import { Link } from 'wouter';
import { Target, Users, Zap } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OWFN_LOGO_URL } from '../constants.ts';

const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-xl shadow-3d hover:shadow-3d-lg hover:scale-105 transition-all duration-300 transform">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary-100 dark:bg-darkPrimary-700 rounded-full text-accent-500 dark:text-darkAccent-400">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-primary-900 dark:text-darkPrimary-100">{title}</h3>
        <p className="text-primary-600 dark:text-darkPrimary-400">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();
    const coinRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!coinRef.current) return;
        const rect = coinRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;

        const mouseX = x - width / 2;
        const mouseY = y - height / 2;
        const rotateY = (mouseX / (width / 2)) * 15; // Max 15 deg rotation
        const rotateX = (-mouseY / (height / 2)) * 15; // Max 15 deg rotation

        const glareX = (x / width) * 100;
        const glareY = (y / height) * 100;

        coinRef.current.style.setProperty('--mx', `${glareX}%`);
        coinRef.current.style.setProperty('--my', `${glareY}%`);
        coinRef.current.style.setProperty('--o', '1');

        const coinElement = coinRef.current.querySelector('.coin') as HTMLElement;
        const shadowElement = coinRef.current.querySelector('.coin-shadow') as HTMLElement;

        if (coinElement) {
            coinElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.07, 1.07, 1.07)`;
        }
        if (shadowElement) {
            shadowElement.style.transform = `translateX(-50%) rotateX(90deg) translateZ(-120px) translateY(${mouseY * 0.5}px) translateX(${mouseX * 0.5}px)`;
            shadowElement.style.opacity = '0.5';
        }
    };

    const handleMouseLeave = () => {
        if (!coinRef.current) return;
        
        coinRef.current.style.setProperty('--o', '0');

        const coinElement = coinRef.current.querySelector('.coin') as HTMLElement;
        const shadowElement = coinRef.current.querySelector('.coin-shadow') as HTMLElement;

        if (coinElement) {
            coinElement.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
        if (shadowElement) {
            shadowElement.style.transform = `translateX(-50%) rotateX(90deg) translateZ(-120px) translateY(0px) translateX(0px)`;
            shadowElement.style.opacity = '0.3';
        }
    };


    return (
        <div className="space-y-16 animate-fade-in-up">
            <section className="text-center bg-gradient-to-br from-white to-primary-200 dark:from-darkPrimary-800 dark:to-darkPrimary-950 rounded-3xl p-8 md:p-16 shadow-3d-lg -mt-8 -mx-8">
                <div className="relative z-10 flex flex-col items-center">
                    <div
                        ref={coinRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="coin-container coin-perspective mb-6 w-48 h-48 cursor-pointer"
                    >
                        <div className="relative w-full h-full">
                            <img
                                src={OWFN_LOGO_URL}
                                alt="OWFN Coin"
                                className="coin w-full h-full object-cover rounded-full shadow-3d-lg"
                            />
                            <div className="coin-glare"></div>
                            <div className="coin-shadow"></div>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-primary-900 dark:text-white leading-tight tracking-tighter drop-shadow-lg">
                        {t('home_title')}
                    </h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-primary-700 dark:text-darkPrimary-200 drop-shadow-md">
                        {t('home_subtitle')}
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <Link to="/presale" className="bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-transform transform hover:scale-105 shadow-lg">
                            {t('presale')}
                        </Link>
                        <Link to="/about" className="bg-transparent border-2 border-accent-400 text-accent-500 dark:border-darkAccent-500 dark:text-darkAccent-500 font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-400/20 dark:hover:bg-darkAccent-500/20 transition-transform transform hover:scale-105">
                            {t('about')}
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 bg-primary-50/50 dark:bg-darkPrimary-800/50 rounded-2xl">
                    <h2 className="text-3xl font-bold text-accent-500 dark:text-darkAccent-400 mb-4">{t('core_message_title')}</h2>
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
        </div>
    );
}