import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'wouter';
import { HeartHandshake, Globe, Rocket, DollarSign, BarChart, Users, Gift, ShieldCheck, ClipboardList, Building, ArrowRight, Twitter, Send } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';
import { OWFN_LOGO_URL, PRESALE_STAGES, MOCK_COMMUNITY_MEMBERS } from '../lib/constants.js';
import { SolIcon } from '../components/IconComponents.js';

const useIntersect = (ref: React.RefObject<HTMLElement>, options: IntersectionObserverInit) => {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIntersecting(true);
                observer.unobserve(entry.target);
            }
        }, options);
        if (ref.current) observer.observe(ref.current);
        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [ref, options]);
    return isIntersecting;
};

const StatCard = ({ icon, value, label, isLoading }: { icon: React.ReactNode, value: string, label: string, isLoading?: boolean }) => (
    <div className="bg-white/30 dark:bg-darkPrimary-800/50 backdrop-blur-md border border-primary-200/30 dark:border-darkPrimary-700/50 rounded-xl p-4 text-center transform transition-transform duration-300 hover:scale-105">
        <div className="text-accent-500 dark:text-darkAccent-400 w-10 h-10 mx-auto mb-2 flex items-center justify-center">{icon}</div>
        {isLoading ? (
             <div className="h-7 w-24 bg-primary-200 dark:bg-darkPrimary-700 rounded-md animate-pulse mx-auto"></div>
        ) : (
            <p className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">{value}</p>
        )}
        <p className="text-sm text-primary-600 dark:text-darkPrimary-400 mt-1">{label}</p>
    </div>
);

const StatsSection = () => {
    const { t, impactTreasuryBalance, socialCases, presaleProgress } = useAppContext();
    const presaleStage = PRESALE_STAGES[0];
    const presalePercent = presaleProgress.isLoading ? 0 : (presaleProgress.soldSOL / presaleStage.hardCap) * 100;
    
    return(
        <section className="container mx-auto -mt-16 relative z-10 animate-fade-in-up">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <StatCard 
                    icon={<DollarSign size={28} />} 
                    value={`${impactTreasuryBalance.toFixed(2)} SOL`} 
                    label={t('total_donated', {defaultValue: 'Donated to Treasury'})} 
                />
                 <StatCard 
                    icon={<HeartHandshake size={28} />} 
                    value={socialCases.length.toString()} 
                    label={t('projects_supported', {defaultValue: 'Social Cases Funded'})} 
                />
                 <StatCard 
                    icon={<BarChart size={28} />} 
                    value={`${presalePercent.toFixed(1)}%`} 
                    label={t('progress', {defaultValue: 'Presale Progress'})} 
                    isLoading={presaleProgress.isLoading}
                />
                <StatCard 
                    icon={<Users size={28} />} 
                    value={MOCK_COMMUNITY_MEMBERS.toLocaleString()} 
                    label={t('home_feature_community_title', {defaultValue: 'Community Members'})} 
                />
            </div>
        </section>
    );
};

const HowItWorksSection = () => {
    const { t } = useAppContext();
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useIntersect(sectionRef, { threshold: 0.15 });

    const steps = [
        { icon: <Gift size={32} />, title: 'Contribute', description: 'A community member contributes to the vision.' },
        { icon: <ShieldCheck size={32} />, title: 'Transparent Treasury', description: 'Funds arrive transparently in the Impact Treasury.' },
        { icon: <ClipboardList size={32} />, title: 'Allocation', description: 'Funds are allocated to a verified social project.' },
        { icon: <Building size={32} />, title: 'Real-World Result', description: 'A school is built, a life is saved. Real impact is made.' },
    ];

    return (
        <section ref={sectionRef} className="container mx-auto text-center">
            <h2 className="text-3xl font-bold text-accent-500 dark:text-darkAccent-400 mb-4">{t('home_how_it_works_title', {defaultValue: 'How It Works'})}</h2>
            <p className="max-w-3xl mx-auto text-lg text-primary-700 dark:text-darkPrimary-300 mb-12">{t('home_how_it_works_subtitle', {defaultValue: 'A simple, transparent flow from contribution to impact.'})}</p>
            <div className="relative grid md:grid-cols-4 gap-8">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-primary-200 dark:bg-darkPrimary-700 hidden md:block" style={{transform: 'translateY(-50%)'}}></div>
                <div className={`absolute top-1/2 left-0 h-1 bg-accent-500 dark:bg-darkAccent-500 hidden md:block transition-all duration-1000 ease-out`} style={{transform: 'translateY(-50%)', width: isVisible ? '100%' : '0%'}}></div>
                 {steps.map((step, index) => (
                    <div 
                        key={step.title} 
                        className={`text-center transition-all ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                        style={{ transitionDuration: '500ms', transitionDelay: `${isVisible ? index * 200 : 0}ms` }}
                    >
                        <div className="relative z-10 mx-auto w-20 h-20 mb-4 flex items-center justify-center bg-white dark:bg-darkPrimary-800 rounded-full text-accent-500 dark:text-darkAccent-400 border-4 border-primary-200 dark:border-darkPrimary-700">
                             {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-primary-900 dark:text-darkPrimary-100">{index + 1}. {step.title}</h3>
                        <p className="text-primary-600 dark:text-darkPrimary-400 mt-1">{step.description}</p>
                    </div>
                 ))}
            </div>
        </section>
    );
};


const CorePrincipleCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white/30 dark:bg-darkPrimary-800/50 p-6 rounded-xl shadow-3d hover:shadow-3d-lg hover:scale-105 transition-all duration-300 transform backdrop-blur-md border border-primary-200/30 dark:border-darkPrimary-700/50">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary-100 dark:bg-darkPrimary-700 rounded-full text-accent-500 dark:text-darkAccent-400 animate-float">
            {icon}
        </div>
        <h3 className="mb-2 text-xl font-bold text-primary-900 dark:text-darkPrimary-100">{title}</h3>
        <p className="text-primary-600 dark:text-darkPrimary-400">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-24">
            <section className="relative text-center bg-gradient-to-br from-white to-primary-200 dark:from-darkPrimary-800 dark:to-darkPrimary-950 rounded-b-3xl pt-8 pb-24 md:pt-16 md:pb-32 shadow-3d-lg -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
                <div className="absolute inset-0 animate-animated-gradient bg-primary-50 dark:bg-darkPrimary-900" style={{backgroundSize: '200% 200%', backgroundImage: 'linear-gradient(-45deg, #f4f4f5, #fafafa, #fef3c7, #fde68a)', animationName: 'animated-gradient'}}></div>
                 <div className="dark:absolute dark:inset-0 dark:animate-animated-gradient" style={{backgroundSize: '200% 200%', backgroundImage: 'linear-gradient(-45deg, #0c0a09, #1c1917, #451a03, #78350f)', animationName: 'animated-gradient'}}></div>

                <div className="relative z-10 flex flex-col items-center px-4">
                    <div className="mb-6 bg-white/20 dark:bg-darkPrimary-950/20 rounded-full w-48 h-48 p-3 shadow-lg backdrop-blur-sm border-2 border-primary-300/30 dark:border-darkPrimary-100/30">
                        <img 
                            src={OWFN_LOGO_URL} 
                            alt="OWFN Logo" 
                            className="w-full h-full rounded-full object-cover"
                        />
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
            
            <StatsSection />

            <section className="container mx-auto">
                <div className="text-center p-8 bg-primary-50/50 dark:bg-darkPrimary-800/50 rounded-2xl">
                    <h2 className="text-3xl font-bold text-accent-500 dark:text-darkAccent-400 mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-primary-700 dark:text-darkPrimary-300">
                        {t('home_message')}
                    </p>
                </div>
            </section>
            
            <HowItWorksSection />
            
            <section className="container mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                    <CorePrincipleCard icon={<HeartHandshake size={32} />} title={t('home_feature_impact_title')}>
                        {t('home_feature_impact_desc')}
                    </CorePrincipleCard>
                    <CorePrincipleCard icon={<Globe size={32} />} title={t('home_feature_community_title')}>
                        {t('home_feature_community_desc')}
                    </CorePrincipleCard>
                    <CorePrincipleCard icon={<Rocket size={32} />} title={t('home_feature_solana_title')}>
                        {t('home_feature_solana_desc')}
                    </CorePrincipleCard>
                </div>
            </section>

            <section className="container mx-auto text-center">
                <h2 className="text-3xl font-bold text-accent-500 dark:text-darkAccent-400 mb-12">{t('home_social_proof_title', { defaultValue: 'A Living, Breathing Movement' })}</h2>
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <h3 className="text-2xl font-bold mb-6">{t('home_community_buzz_title', {defaultValue: 'From Our Community'})}</h3>
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-md text-left flex items-start gap-4">
                                <Twitter className="w-8 h-8 text-[#1DA1F2] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-bold">Solana.Maxi <span className="text-primary-500 font-normal">@solmaxi · 2h</span></p>
                                    <p>Just discovered $OWFN. A project using crypto for actual good in the world, fully transparent on-chain. This is what blockchain should be about! #CryptoForGood #Solana</p>
                                </div>
                            </div>
                             <div className="bg-white dark:bg-darkPrimary-800 p-4 rounded-lg shadow-md text-left flex items-start gap-4">
                                <Send className="w-8 h-8 text-[#0088cc] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-bold">Elena R.</p>
                                    <p>The community in the OWFN Telegram is so positive and helpful. It really feels like a family working towards a common goal. Happy to be part of this.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-6">{t('home_partners_title', {defaultValue: 'Partners & Advisors'})}</h3>
                        <div className="bg-primary-50 dark:bg-darkPrimary-800/50 p-6 rounded-lg">
                             <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('home_partners_desc', {defaultValue: 'We are actively seeking strategic partnerships post-presale. Stay tuned for announcements.'})}</p>
                            <div className="flex justify-center items-center gap-8 opacity-40 grayscale">
                                 <div className="text-center">
                                    <div className="w-20 h-20 bg-primary-200 dark:bg-darkPrimary-700 rounded-full mx-auto"></div>
                                    <p className="mt-2 font-semibold">Partner A</p>
                                </div>
                                 <div className="text-center">
                                    <div className="w-20 h-20 bg-primary-200 dark:bg-darkPrimary-700 rounded-full mx-auto"></div>
                                    <p className="mt-2 font-semibold">Partner B</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-primary-200 dark:bg-darkPrimary-700 rounded-full mx-auto"></div>
                                    <p className="mt-2 font-semibold">Advisor C</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}