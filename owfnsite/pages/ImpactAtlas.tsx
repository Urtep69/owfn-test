import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { SocialCase } from '../types.ts';
import { AlertTriangle, Circle, CheckCircle, X, MapPin, DollarSign, Filter, ChevronsRight, Search, Globe as GlobeIcon, Star, Zap } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar.tsx';

const statusConfig: { [key in SocialCase['status']]: { icon: React.ReactNode; labelKey: string; color: string; pulseColor: string } } = {
    active: { icon: <Circle className="w-full h-full text-blue-400 fill-current" />, labelKey: 'active_project', color: 'bg-blue-400', pulseColor: 'shadow-blue-400' },
    urgent: { icon: <AlertTriangle className="w-full h-full text-yellow-400 fill-current" />, labelKey: 'active_project', color: 'bg-yellow-400', pulseColor: 'shadow-yellow-400' },
    completed: { icon: <Star className="w-full h-full text-amber-300 fill-current" />, labelKey: 'completed_project', color: 'bg-amber-300', pulseColor: 'shadow-amber-300' },
    'urgent-active': {
        icon: (
            <div className="relative w-full h-full">
                <Circle className="absolute w-full h-full text-blue-400 fill-current" />
                <AlertTriangle className="absolute w-3/4 h-3/4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-400 fill-yellow-400/50" />
            </div>
        ),
        labelKey: 'active_project',
        color: 'bg-yellow-400',
        pulseColor: 'shadow-yellow-400'
    },
};

const Globe = ({ cases, onCaseClick, rotation }: { cases: SocialCase[], onCaseClick: (c: SocialCase) => void, rotation: {x: number, y: number} }) => {
    return (
        <div className="relative w-full aspect-square max-w-[500px] lg:max-w-[600px] mx-auto perspective-1000">
            <div 
                className="absolute inset-0 transform-style-3d animate-globe-spin"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    animationPlayState: 'running',
                }}
            >
                <div className="absolute inset-0 rounded-full globe-surface"></div>
                <div className="absolute -inset-4 rounded-full bg-blue-400/10 dark:bg-blue-300/10 blur-xl"></div>
                
                {cases.map(socialCase => (
                    <div
                        key={socialCase.id}
                        className="absolute top-1/2 left-1/2 w-6 h-6 -mt-3 -ml-3 transform-style-3d cursor-pointer group"
                        style={{
                            transform: `rotateY(${socialCase.lng}deg) rotateX(${-socialCase.lat}deg) translateZ(calc(50% + 3px))`,
                        }}
                        onClick={() => onCaseClick(socialCase)}
                        role="button"
                        aria-label={`View case: ${socialCase.title['en']}`}
                    >
                        <div className={`relative w-full h-full ${socialCase.status !== 'completed' ? 'animate-marker-pulse' : ''} ${statusConfig[socialCase.status].pulseColor}`}>
                            <div className="absolute inset-0 bg-black/30 dark:bg-black/50 rounded-full scale-150 blur-sm"></div>
                            <div className={`absolute inset-0 rounded-full border-2 border-white/50 dark:border-white/70 transition-transform group-hover:scale-125`}>
                                {statusConfig[socialCase.status].icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                .globe-surface {
                    background-image:
                        radial-gradient(circle at 25% 30%, white 0%, rgba(255, 255, 255, 0.4) 4%, transparent 15%),
                        radial-gradient(ellipse at 30% 35%, #556B2F 2%, transparent 15%),
                        radial-gradient(ellipse at 28% 45%, #8FBC8F 3%, transparent 15%),
                        radial-gradient(ellipse at 40% 65%, #228B22 4%, transparent 18%),
                        radial-gradient(ellipse at 55% 55%, #DAA520 5%, transparent 20%),
                        radial-gradient(ellipse at 60% 45%, #556B2F 4%, transparent 15%),
                        radial-gradient(ellipse at 70% 35%, #6B8E23 6%, transparent 22%),
                        radial-gradient(ellipse at 80% 40%, #8FBC8F 5%, transparent 20%),
                        radial-gradient(ellipse at 85% 70%, #CD853F 2%, transparent 10%),
                        radial-gradient(ellipse at 50% 5%, white 1%, transparent 8%),
                        radial-gradient(ellipse at 50% 95%, white 2%, transparent 10%),
                        radial-gradient(circle at 50% 50%, #1e3a8a, #1e40af);
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.5), 0 0 20px rgba(74, 153, 232, 0.4);
                }
                .dark .globe-surface {
                     background-image:
                        radial-gradient(circle at 25% 30%, white 0%, rgba(255, 255, 255, 0.2) 4%, transparent 15%),
                        radial-gradient(ellipse at 30% 35%, #4a5c27 2%, transparent 15%),
                        radial-gradient(ellipse at 28% 45%, #79a179 3%, transparent 15%),
                        radial-gradient(ellipse at 40% 65%, #1c7a1c 4%, transparent 18%),
                        radial-gradient(ellipse at 55% 55%, #b88b1b 5%, transparent 20%),
                        radial-gradient(ellipse at 60% 45%, #4a5c27 4%, transparent 15%),
                        radial-gradient(ellipse at 70% 35%, #5a7a1e 6%, transparent 22%),
                        radial-gradient(ellipse at 80% 40%, #79a179 5%, transparent 20%),
                        radial-gradient(ellipse at 85% 70%, #b57437 2%, transparent 10%),
                        radial-gradient(ellipse at 50% 5%, white 1%, transparent 8%),
                        radial-gradient(ellipse at 50% 95%, white 2%, transparent 10%),
                        radial-gradient(circle at 50% 50%, #172554, #1e3a8a);
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 0 30px rgba(147, 197, 253, 0.3);
                }
            `}</style>
        </div>
    );
};

const CaseDetailModal = ({ socialCase, onClose }: { socialCase: SocialCase | null, onClose: () => void }) => {
    const { t, currentLanguage } = useAppContext();
    if (!socialCase) return null;
    
    const title = socialCase.title[currentLanguage.code] || socialCase.title['en'];
    const description = socialCase.description[currentLanguage.code] || socialCase.description['en'];
    const progress = (socialCase.donated / socialCase.goal) * 100;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={onClose}>
            <div className="bg-white dark:bg-darkPrimary-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <img src={socialCase.imageUrl} alt={title} className="w-full h-64 object-cover" />
                <div className="p-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-primary-500 hover:text-primary-800 dark:text-darkPrimary-400 dark:hover:text-darkPrimary-100 p-2 rounded-full bg-white/50 dark:bg-darkPrimary-700/50">
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold mb-4">{title}</h2>
                    <p className="text-primary-600 dark:text-darkPrimary-300 mb-6">{description}</p>
                    <div className="mb-6">
                        <ProgressBar progress={progress} />
                        <div className="flex justify-between text-sm font-semibold mt-2">
                            <span><span className="font-bold text-accent-600 dark:text-darkAccent-400">${socialCase.donated.toLocaleString()}</span> {t('funded')}</span>
                            <span><span className="font-normal text-primary-600 dark:text-darkPrimary-400">{t('goal')}:</span> ${socialCase.goal.toLocaleString()}</span>
                        </div>
                    </div>
                    <Link to={`/impact/case/${socialCase.id}`} className="w-full text-center bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors flex items-center justify-center gap-2">
                        {t('view_case')} <ChevronsRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function ImpactAtlas() {
    const { t, socialCases, currentLanguage } = useAppContext();
    const [selectedCase, setSelectedCase] = useState<SocialCase | null>(null);
    const [filter, setFilter] = useState<'all' | SocialCase['status']>('all');
    const [rotation, setRotation] = useState({ x: 10, y: 0 });
    const globeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let frameId: number;
        const animateRotation = () => {
            setRotation(r => ({ ...r, y: r.y + 0.05 }));
            frameId = requestAnimationFrame(animateRotation);
        };
        frameId = requestAnimationFrame(animateRotation);
        return () => cancelAnimationFrame(frameId);
    }, []);
    
    const filteredCases = useMemo(() => {
        if (filter === 'all') return socialCases;
        if (filter === 'urgent-active' || filter === 'urgent') return socialCases.filter(c => c.status === 'urgent' || c.status === 'urgent-active');
        return socialCases.filter(c => c.status === filter);
    }, [socialCases, filter]);

    const activeProjectsCount = socialCases.filter(c => c.status === 'active' || c.status === 'urgent-active').length;
    const ecosystemHealth = Math.min(100, (activeProjectsCount / 5) * 100); // Scale health based on up to 5 active projects

    return (
        <div className="animate-fade-in-up space-y-8">
            <CaseDetailModal socialCase={selectedCase} onClose={() => setSelectedCase(null)} />
            
            <div className="text-center">
                <h1 className="text-4xl font-bold font-serif text-accent-600 dark:text-darkAccent-400">{t('impact_atlas_title')}</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('impact_atlas_subtitle')}
                </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2" ref={globeRef}>
                   <Globe cases={filteredCases} onCaseClick={setSelectedCase} rotation={rotation} />
                </div>
                <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d space-y-4">
                    <h3 className="font-bold text-lg border-b border-primary-200 dark:border-darkPrimary-700 pb-2">{t('legend')}</h3>
                    <div className="space-y-3 text-sm">
                       {Object.entries(statusConfig).map(([key, { icon, labelKey, color }]) => (
                           <div key={key} className="flex items-center gap-3">
                               <div className={`w-5 h-5 flex-shrink-0 ${color}`}>{icon}</div>
                               <span className="text-primary-700 dark:text-darkPrimary-300">{t(labelKey)}</span>
                           </div>
                       ))}
                       <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex-shrink-0"><Zap className="text-cyan-400" /></div>
                            <span className="text-primary-700 dark:text-darkPrimary-300">{t('recent_donation')}</span>
                        </div>
                    </div>
                     <h3 className="font-bold text-lg border-b border-primary-200 dark:border-darkPrimary-700 pb-2 pt-4">{t('ecosystem_health')}</h3>
                     <div className="space-y-2">
                         <p className="font-bold text-xl text-center text-green-500">{t('calm')}</p>
                         <div className="w-full bg-primary-200 dark:bg-darkPrimary-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-blue-400 to-green-400 h-3 rounded-full" style={{ width: `${ecosystemHealth}%` }}></div>
                         </div>
                     </div>
                </div>
            </div>

            <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-lg shadow-3d-lg">
                <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{t('social_cases')}</h2>
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'active', 'urgent', 'completed'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === f ? 'bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950' : 'bg-primary-100 hover:bg-primary-200 dark:bg-darkPrimary-700 dark:hover:bg-darkPrimary-600'}`}>
                               {t(f === 'all' ? 'faq_category_all' : `status_${f}` as any, { defaultValue: f.charAt(0).toUpperCase() + f.slice(1) })}
                            </button>
                        ))}
                    </div>
                </div>
                {filteredCases.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCases.map(c => (
                            <div key={c.id} onClick={() => setSelectedCase(c)} className="cursor-pointer bg-primary-50 dark:bg-darkPrimary-900 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
                                <img src={c.imageUrl} alt={c.title[currentLanguage.code] || c.title['en']} className="w-full h-40 object-cover rounded-t-lg" />
                                <div className="p-4 flex-grow flex flex-col">
                                    <h3 className="font-bold flex-grow">{c.title[currentLanguage.code] || c.title['en']}</h3>
                                    <ProgressBar progress={(c.donated / c.goal) * 100} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-primary-600 dark:text-darkPrimary-400">{t('no_active_cases_in_category')}</p>
                )}
            </div>
        </div>
    );
}