import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import type { SocialCase } from '../types.ts';
import { Star, Circle, Zap } from 'lucide-react';

// Extend SocialCase for local state management within the Atlas
interface AtlasSocialCase extends SocialCase {
    donated_on_atlas: number;
}

const GLOBE_RADIUS = 250; // in pixels

export const ImpactAtlasComponent = () => {
    const { t, socialCases } = useAppContext();
    const [projects, setProjects] = useState<AtlasSocialCase[]>([]);
    const [activeDonations, setActiveDonations] = useState<Record<string, boolean>>({});
    const [ecosystemHealth, setEcosystemHealth] = useState(50); // Starts at a neutral 50%

    useEffect(() => {
        setProjects(socialCases.map(c => ({ ...c, donated_on_atlas: c.donated })));
    }, [socialCases]);

    // Simulate real-time donations
    useEffect(() => {
        const interval = setInterval(() => {
            if (projects.length === 0) return;

            const activeProjects = projects.filter(p => p.donated_on_atlas < p.goal);
            if (activeProjects.length === 0) return;

            // Pick a random active project to donate to
            const randomProjectIndex = Math.floor(Math.random() * activeProjects.length);
            const targetProject = activeProjects[randomProjectIndex];
            
            const donationAmount = Math.random() * targetProject.goal * 0.05; // Donate up to 5% of goal

            setProjects(prevProjects => 
                prevProjects.map(p => 
                    p.id === targetProject.id 
                        ? { ...p, donated_on_atlas: Math.min(p.goal, p.donated_on_atlas + donationAmount) }
                        : p
                )
            );
            
            // Trigger visual glow effect
            setActiveDonations(prev => ({ ...prev, [targetProject.id]: true }));
            setTimeout(() => {
                setActiveDonations(prev => ({ ...prev, [targetProject.id]: false }));
            }, 2000);

            // Boost ecosystem health
            setEcosystemHealth(prev => Math.min(100, prev + 5));

        }, 3000); // New donation every 3 seconds

        return () => clearInterval(interval);
    }, [projects]);

    // Ecosystem health decay
    useEffect(() => {
        const decayInterval = setInterval(() => {
            setEcosystemHealth(prev => Math.max(0, prev - 0.5));
        }, 1000);
        return () => clearInterval(decayInterval);
    }, []);

    const healthStatus = useMemo(() => {
        if (ecosystemHealth > 75) return { text: t('vibrant'), color: 'text-green-400' };
        if (ecosystemHealth > 25) return { text: t('calm'), color: 'text-yellow-400' };
        return { text: 'Quiet', color: 'text-blue-400' };
    }, [ecosystemHealth, t]);
    
    const globeStyles: React.CSSProperties = {
        width: `${GLOBE_RADIUS * 2}px`,
        height: `${GLOBE_RADIUS * 2}px`,
        backgroundImage: `
            /* SPECULAR HIGHLIGHT */
            radial-gradient(circle at 40% 35%, #fff 0%, #fff0 8%),
            
            /* CLOUDS */
            radial-gradient(ellipse at 15% 20%, #fff8 0%, #fff0 25%),
            radial-gradient(ellipse at 25% 75%, #fff6 0%, #fff0 20%),
            radial-gradient(ellipse at 80% 85%, #fff5 0%, #fff0 15%),
            radial-gradient(ellipse at 70% 20%, #fff6 0%, #fff0 20%),
            
            /* LANDMASSES - MORE DETAILED */
            /* South America */
            radial-gradient(ellipse at 30% 70%, #2a9d8f 10%, #26465300 40%),
            /* North America */
            radial-gradient(ellipse at 25% 40%, #8ab17d 20%, #26465300 50%),
            /* Africa */
            radial-gradient(ellipse at 55% 55%, #e9c46a 15%, #f4a261 25%, #26465300 45%),
            radial-gradient(ellipse at 53% 65%, #2a9d8f 10%, #26465300 30%),
            /* Europe/Asia */
            radial-gradient(ellipse at 70% 30%, #a3b18a 25%, #26465300 55%),
            /* Australia */
            radial-gradient(ellipse at 85% 75%, #e76f51 8%, #26465300 25%),
            
            /* POLAR ICE CAPS */
            radial-gradient(ellipse at 50% 98%, #fff 2%, #fff0 20%),
            radial-gradient(ellipse at 50% 2%, #fff 3%, #fff0 25%),
            
            /* OCEAN BASE */
            radial-gradient(circle at 50% 50%, #0077b6, #023e8a 80%, #001d3d 100%)
        `,
        boxShadow: `
            inset 20px 0 50px 10px #03045e, 
            inset -10px 0 20px 5px #000,
            0 0 80px -20px #48cae4,
            0 0 120px -30px #ade8f4
        `
    };

    return (
        <div className="relative bg-darkPrimary-950 p-4 rounded-2xl shadow-3d-lg overflow-hidden">
            <div 
                className="absolute inset-0 aurora-bg transition-opacity duration-1000"
                style={{ opacity: Math.max(0.2, ecosystemHealth / 100) }}
            ></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                {/* Globe Section */}
                <div className="md:col-span-3 flex items-center justify-center min-h-[550px]">
                    <div className="w-full h-full flex items-center justify-center perspective-1000">
                        <div 
                            className="relative transform-style-3d animate-globe-spin"
                            style={{ width: `${GLOBE_RADIUS * 2}px`, height: `${GLOBE_RADIUS * 2}px` }}
                        >
                            <div 
                                className="absolute inset-0 rounded-full"
                                style={globeStyles}
                            ></div>
                            
                            {projects.map(p => {
                                const isCompleted = p.donated_on_atlas >= p.goal;
                                const isGlowing = activeDonations[p.id];

                                return (
                                    <div
                                        key={p.id}
                                        className="absolute top-1/2 left-1/2 -mt-2 -ml-2 transform-style-3d backface-hidden cursor-pointer group"
                                        title={p.title.en}
                                        style={{ transform: `rotateY(${p.lng}deg) rotateX(${-p.lat}deg) translateZ(${GLOBE_RADIUS}px)` }}
                                    >
                                        <div className={`relative w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'text-yellow-400 animate-marker-pulse' : 'text-accent-400'}`}>
                                            {isCompleted ? <Star fill="currentColor" /> : <Circle fill="currentColor" />}
                                            {isGlowing && <div className="absolute inset-0 rounded-full animate-donation-glow bg-accent-400/50"></div>}
                                        </div>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-darkPrimary-800/80 backdrop-blur-sm text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backface-hidden">
                                            {p.title.en}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Legend & Stats Section */}
                <div className="md:col-span-1 bg-darkPrimary-900/50 backdrop-blur-sm border border-darkPrimary-700/50 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-bold text-darkPrimary-100 border-b border-darkPrimary-700 pb-2">{t('legend')}</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3"><Circle className="text-accent-400 w-5 h-5" fill="currentColor"/><span>{t('active_project')}</span></div>
                        <div className="flex items-center gap-3"><Star className="text-yellow-400 w-5 h-5" fill="currentColor"/><span>{t('completed_project')}</span></div>
                        <div className="flex items-center gap-3"><div className="w-5 h-5 flex items-center justify-center"><Zap className="text-accent-400 w-5 h-5 animate-ping absolute opacity-75"/><Zap className="text-accent-400 w-4 h-4 relative"/></div><span>{t('recent_donation')}</span></div>
                    </div>
                    <h3 className="text-lg font-bold text-darkPrimary-100 border-b border-darkPrimary-700 pb-2 pt-4">{t('ecosystem_health')}</h3>
                    <div className="text-center">
                        <p className={`text-3xl font-bold ${healthStatus.color}`}>{healthStatus.text}</p>
                        <div className="w-full bg-darkPrimary-700 rounded-full h-2.5 mt-2">
                            <div className="bg-gradient-to-r from-blue-500 via-yellow-400 to-green-400 h-2.5 rounded-full" style={{ width: `${ecosystemHealth}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
