import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

interface UseUserBehaviorProps {
    onTrigger: (trigger: { type: 'exit-intent' | 'dwell-time' | 'scroll-depth'; details?: any }) => void;
    enabled: boolean;
}

// Dwell time configuration (in milliseconds)
const DWELL_TIME_CONFIG: { [key: string]: number } = {
    '/presale': 30000,
    '/donations': 30000,
};

// Scroll depth configuration (percentage)
const SCROLL_DEPTH_CONFIG: { [key: string]: number } = {
    '/roadmap': 90,
    '/whitepaper': 90,
};

export const useUserBehavior = ({ onTrigger, enabled }: UseUserBehaviorProps) => {
    const [location] = useLocation();
    const dwellTimerRef = useRef<number | null>(null);
    const hasTriggeredForPage = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!enabled) {
            return;
        }
        
        const pageKey = (type: string) => `${location}-${type}`;

        // --- Dwell Time Logic ---
        const dwellTime = DWELL_TIME_CONFIG[location];
        if (dwellTime && !hasTriggeredForPage.current.has(pageKey('dwell'))) {
            dwellTimerRef.current = window.setTimeout(() => {
                onTrigger({ type: 'dwell-time', details: { page: location } });
                hasTriggeredForPage.current.add(pageKey('dwell'));
            }, dwellTime);
        }

        // --- Exit Intent Logic ---
        const handleMouseOut = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasTriggeredForPage.current.has(pageKey('exit'))) {
                onTrigger({ type: 'exit-intent' });
                hasTriggeredForPage.current.add(pageKey('exit'));
            }
        };

        // --- Scroll Depth Logic ---
        const handleScroll = () => {
            const scrollDepth = SCROLL_DEPTH_CONFIG[location];
            if (!scrollDepth || hasTriggeredForPage.current.has(pageKey('scroll'))) {
                return;
            }
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollableHeight <= 0) return;
            
            const currentPercentage = (window.scrollY / scrollableHeight) * 100;
            if (currentPercentage >= scrollDepth) {
                onTrigger({ type: 'scroll-depth', details: { page: location } });
                hasTriggeredForPage.current.add(pageKey('scroll'));
            }
        };
        
        // --- Cleanup and Event Listeners ---
        const clearDwellTimer = () => {
            if (dwellTimerRef.current) {
                clearTimeout(dwellTimerRef.current);
            }
        };

        document.addEventListener('mouseout', handleMouseOut);
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Any interaction should cancel the dwell timer for this page
        window.addEventListener('click', clearDwellTimer);
        window.addEventListener('keydown', clearDwellTimer);

        return () => {
            clearDwellTimer();
            document.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('click', clearDwellTimer);
            window.removeEventListener('keydown', clearDwellTimer);
        };
    }, [location, onTrigger, enabled]);
};