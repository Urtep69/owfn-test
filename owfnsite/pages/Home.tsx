import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'wouter';
import { HeartHandshake, Globe, Rocket, DollarSign, BarChart, Users, ArrowRight, Twitter, Send, CheckCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';
// FIX: Import PROJECT_LINKS to resolve reference error.
import { OWFN_LOGO_URL, PRESALE_STAGES, MOCK_COMMUNITY_MEMBERS, PROJECT_LINKS } from '../lib/constants.js';
import { DiscordIcon } from '../components/IconComponents.js';

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

const StatsTicker = () => {
    const { t, impactTreasuryBalance, socialCases, presaleProgress } = useAppContext();
    const presaleStage = PRESALE_STAGES[0];
    const presalePercent = presaleProgress.isLoading ? 0 : (presaleProgress.soldSOL / presaleStage.hardCap) * 100;
    
    const stats = [
        { icon: <DollarSign size={18} />, value: `${impactTreasuryBalance.toFixed(2)} SOL`, label: t('total_donated') },
        { icon: <HeartHandshake size={18} />, value: socialCases.length.toString(), label: t('projects_supported') },
        { icon: <BarChart size={18} />, value: `${presalePercent.toFixed(1)}%`, label: t('progress') },
        { icon: <Users size={18} />, value: MOCK_COMMUNITY_MEMBERS.toLocaleString(), label: t('home_feature_community_title') },
    ];
    
    // Duplicate the stats to create a seamless loop
    const tickerItems = [...stats, ...stats, ...stats];

    return (
        <div className="absolute bottom-0 left-0 w-full bg-black/10 dark:bg-black/20 backdrop-blur-sm py-3 overflow-hidden">
            <div className="flex animate-ticker-scroll hover:pause">
                {tickerItems.map((stat, index) => (
                    <div key={index} className="flex items-center text-white mx-6 flex-shrink-0">
                        <div className="mr-3 text-accent-300 dark:text-darkAccent-300">{stat.icon}</div>
                        <span className="font-semibold mr-2">{stat.label}:</span>
                        <span className="font-bold text-lg">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HowItWorksSection = () => {
    const { t } = useAppContext();
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisible = useIntersect(sectionRef, { threshold: 0.1 });

    const steps = [
        { icon: 'M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.73 2.73m0 0l-1.27 1.27m1.27-1.27L10.5 9.75M12 21a9 9 0 009-9 9.75 9.75 0 00-2.73-6.73m0 0l1.27-1.27m-1.27 1.27L13.5 14.25', title: 'Contribute', description: 'A community member contributes to the vision.' },
        { icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036V21', title: 'Transparent Treasury', description: 'Funds arrive transparently in the Impact Treasury.' },
        { icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h15.75c.621 0 1.125.504 1.125 1.125v6.75C21 20.496 20.496 21 19.875 21H4.125C3.504 21 3 20.496 3 19.875v-6.75zM12 3v9.75m0 0l-2.25-2.25M12 12.75l2.25-2.25', title: 'Allocation', description: 'Funds are allocated to a verified social project.' },
        { icon: 'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z', title: 'Real-World Result', description: 'A school is built, a life is saved. Real impact is made.' },
    ];

    const Step = ({ step, index }: { step: typeof steps[0], index: number }) => {
        const ref = useRef<HTMLDivElement>(null);
        const isVisible = useIntersect(ref, { threshold: 0.5 });
        const isEven = index % 2 === 0;
        return(
             <div ref={ref} className={`flex items-center w-full mb-8 ${isEven ? 'md:flex-row-reverse justify-end' : 'justify-start'}`}>
                <div className="hidden md:block w-5/12"></div>
                <div className={`z-10 absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0 flex items-center justify-center w-16 h-16 bg-white dark:bg-darkPrimary-800 rounded-full border-4 transition-all duration-500 ${isVisible ? 'border-accent-500 dark:border-darkAccent-500 scale-100' : 'border-primary-300 dark:border-darkPrimary-600 scale-0'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-accent-600 dark:text-darkAccent-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                </div>
                <div className={`w-full md:w-5/12 p-6 rounded-lg shadow-lg card-3d-hover bg-white/50 dark:bg-darkPrimary-800/50 backdrop-blur-md transition-all duration-700 ease-out ${isEven ? 'md:mr-8' : 'md:ml-8'} ${isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isEven ? 'translate-x-10' : '-translate-x-10'}`}`}>
                    <h3 className="text-xl font-bold text-primary-900 dark:text-darkPrimary-100">{index + 1}. {step.title}</h3>
                    <p className="text-primary-600 dark:text-darkPrimary-400 mt-1">{step.description}</p>
                </div>
            </div>
        )
    }

    return (
        <section ref={sectionRef} className="container mx-auto text-center py-16">
            <h2 className="text-4xl font-bold text-accent-500 dark:text-darkAccent-400 mb-4">{t('home_how_it_works_title', {defaultValue: 'How It Works'})}</h2>
            <p className="max-w-3xl mx-auto text-lg text-primary-700 dark:text-darkPrimary-300 mb-16">{t('home_how_it_works_subtitle', {defaultValue: 'A simple, transparent flow from contribution to impact.'})}</p>
            <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 bg-primary-200 dark:bg-darkPrimary-700 h-full">
                    <div className="bg-accent-500 dark:bg-darkAccent-500 w-1 transition-all duration-500 ease-linear" style={{height: isVisible ? '100%' : '0%'}}></div>
                </div>
                {steps.map((step, index) => <Step key={index} step={step} index={index} />)}
            </div>
        </section>
    );
};


const CorePrincipleCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="card-3d-hover bg-white/30 dark:bg-darkPrimary-800/50 p-8 rounded-2xl shadow-3d transition-all duration-300 backdrop-blur-md border border-primary-200/30 dark:border-darkPrimary-700/50 text-center">
        <div className="flex items-center justify-center w-20 h-20 mb-6 bg-primary-100 dark:bg-darkPrimary-700 rounded-full text-accent-500 dark:text-darkAccent-400 mx-auto animate-float">
            {icon}
        </div>
        <h3 className="mb-2 text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">{title}</h3>
        <p className="text-primary-600 dark:text-darkPrimary-400 leading-relaxed">{children}</p>
    </div>
);

export default function Home() {
    const { t } = useAppContext();

    return (
        <div className="space-y-16 md:space-y-24">
            <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center text-center -mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden">
                <div className="absolute inset-0 bg-primary-100 dark:bg-darkPrimary-950">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiPjxwYXRoIGQ9Ik0wIC41SDMyTTYuNSAwVjMyTTEzIDBWMzJNMjAgMFYzMk0yNi41IDBWMzJNMCA2LjVIMzJNMCAxM0gzMk0wIDIwSDMyTTAgMjYuNUgzMiIgdHJhbnNmb3JtPSJyb3RhdGUoNDUsIDE2LCAxNikiLz48L3N2Zz4=')] opacity-50"></div>
                     <div className="absolute inset-0 bg-gradient-to-b from-primary-100/0 via-primary-100/50 to-primary-100 dark:from-darkPrimary-950/0 dark:via-darkPrimary-950/50 dark:to-darkPrimary-900"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center px-4 animate-fade-in-up">
                    <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8" style={{ perspective: '1000px' }}>
                        <div className="absolute inset-0 rounded-full border border-accent-500/20 dark:border-darkAccent-400/20 animate-[spin_30s_linear_infinite] transform-style-3d"></div>
                        <div className="absolute inset-3 rounded-full border border-accent-500/20 dark:border-darkAccent-400/20 animate-[spin_25s_linear_infinite_reverse] transform-style-3d"></div>
                        <div className="absolute inset-6 rounded-full border-2 border-accent-500/30 dark:border-darkAccent-400/30 animate-[spin_20s_linear_infinite] transform-style-3d"></div>
                        <div className="absolute inset-0 flex items-center justify-center animate-glow">
                             <img 
                                src={OWFN_LOGO_URL} 
                                alt="OWFN Logo" 
                                className="w-3/4 h-3/4 rounded-full object-cover shadow-2xl"
                            />
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
                <StatsTicker />
            </section>
            
            <section className="container mx-auto">
                <div className="text-center p-8 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-darkPrimary-800/50 dark:to-darkPrimary-900/50 rounded-2xl shadow-lg border border-primary-200/50 dark:border-darkPrimary-700/50">
                    <h2 className="text-3xl font-bold text-accent-500 dark:text-darkAccent-400 mb-4">{t('core_message_title')}</h2>
                    <p className="max-w-4xl mx-auto text-lg text-primary-700 dark:text-darkPrimary-300 leading-relaxed">
                        {t('home_message')}
                    </p>
                </div>
            </section>
            
            <HowItWorksSection />
            
            <section className="container mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                     <CorePrincipleCard icon={<HeartHandshake size={36} />} title={t('home_feature_impact_title')}>
                        {t('home_feature_impact_desc')}
                    </CorePrincipleCard>
                    <CorePrincipleCard icon={<Globe size={36} />} title={t('home_feature_community_title')}>
                        {t('home_feature_community_desc')}
                    </CorePrincipleCard>
                    <CorePrincipleCard icon={<Rocket size={36} />} title={t('home_feature_solana_title')}>
                        {t('home_feature_solana_desc')}
                    </CorePrincipleCard>
                </div>
            </section>

             <section className="container mx-auto text-center">
                <h2 className="text-4xl font-bold text-accent-500 dark:text-darkAccent-400 mb-12">{t('home_social_proof_title', { defaultValue: 'A Living, Breathing Movement' })}</h2>
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div>
                        <h3 className="text-2xl font-bold mb-6">{t('home_community_buzz_title', {defaultValue: 'From Our Community'})}</h3>
                        <div className="space-y-4">
                            <div className="card-3d-hover bg-white/30 dark:bg-darkPrimary-800/50 p-6 rounded-lg shadow-md text-left flex items-start gap-4 backdrop-blur-md border border-primary-200/30 dark:border-darkPrimary-700/50">
                                <Twitter className="w-8 h-8 text-[#1DA1F2] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-bold">Solana.Maxi <span className="text-primary-500 font-normal">@solmaxi · 2h</span></p>
                                    <p>Just discovered $OWFN. A project using crypto for actual good in the world, fully transparent on-chain. This is what blockchain should be about! #CryptoForGood #Solana</p>
                                </div>
                            </div>
                             <div className="card-3d-hover bg-white/30 dark:bg-darkPrimary-800/50 p-6 rounded-lg shadow-md text-left flex items-start gap-4 backdrop-blur-md border border-primary-200/30 dark:border-darkPrimary-700/50">
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
                        <div className="card-3d-hover bg-white/30 dark:bg-darkPrimary-800/50 p-6 rounded-lg backdrop-blur-md border border-primary-200/30 dark:border-darkPrimary-700/50">
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
            
            <section className="container mx-auto">
                <div className="relative p-12 text-center bg-gradient-to-br from-accent-400 to-accent-600 dark:from-darkAccent-500 dark:to-darkAccent-700 rounded-2xl shadow-3d-lg overflow-hidden">
                     <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full"></div>
                     <div className="absolute -bottom-16 -left-12 w-64 h-64 bg-white/10 rounded-full"></div>
                     <div className="relative z-10">
                        <h2 className="text-4xl font-extrabold text-white mb-4 drop-shadow-md">{t('home_join_title', {defaultValue: 'Join the Movement'})}</h2>
                        <p className="text-lg text-accent-100 dark:text-darkAccent-100 max-w-2xl mx-auto mb-8 drop-shadow-sm">{t('home_join_desc', {defaultValue: 'Become part of a global family dedicated to making a real difference. Your journey starts here.'})}</p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <Link to="/presale" className="bg-white text-accent-900 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-200 transition-transform transform hover:scale-105 shadow-lg">
                                {t('buy_now')}
                            </Link>
                             <a href={PROJECT_LINKS.telegramGroup} target="_blank" rel="noopener noreferrer" className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white/20 transition-transform transform hover:scale-105">
                                {t('home_feature_community_title')}
                            </a>
                        </div>
                     </div>
                </div>
            </section>
        </div>
    );
}