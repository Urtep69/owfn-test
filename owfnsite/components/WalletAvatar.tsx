import React, { useMemo } from 'react';

interface WalletAvatarProps {
    address: string;
    className?: string;
}

const COLORS = [
    '#fbbf24', // accent-400
    '#f59e0b', // accent-500
    '#d97706', // accent-600
    '#b45309', // accent-700
    '#eac06a', // darkAccent-400 (lighter)
    '#d2b48c', // darkAccent-500 (lighter)
];

// Simple hashing function to get a number from a string
const simpleHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export const WalletAvatar: React.FC<WalletAvatarProps> = ({ address, className = 'w-8 h-8' }) => {
    const avatarData = useMemo(() => {
        if (!address) return { bgColor: '#374151', gradient: { c1: '#4b5563', c2: '#6b7280' }, shapes: [] };
        
        const hash = simpleHash(address);
        
        const c1 = COLORS[hash % COLORS.length];
        const c2 = COLORS[(hash >> 8) % COLORS.length];

        const shapes = Array.from({ length: 3 }).map((_, i) => {
            const shapeHash = simpleHash(address.slice(i * 4, (i + 1) * 4));
            return {
                cx: 15 + (shapeHash % 70),
                cy: 15 + ((shapeHash >> 4) % 70),
                r: 8 + (shapeHash % 12),
                fill: 'white',
                opacity: 0.1 + ((shapeHash % 20) / 100)
            };
        });
        
        return { gradient: { id: `grad_${address}`, c1, c2 }, shapes };
    }, [address]);

    return (
        <div className={`${className} rounded-full overflow-hidden border-2 border-primary-200/50 dark:border-darkPrimary-700/50`}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                 <defs>
                    <linearGradient id={avatarData.gradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={avatarData.gradient.c1} />
                        <stop offset="100%" stopColor={avatarData.gradient.c2} />
                    </linearGradient>
                </defs>
                <rect width="100" height="100" fill={`url(#${avatarData.gradient.id})`} />
                {avatarData.shapes.map((shape, i) => (
                    <circle 
                        key={i}
                        cx={shape.cx}
                        cy={shape.cy}
                        r={shape.r}
                        fill={shape.fill}
                        fillOpacity={shape.opacity}
                    />
                ))}
            </svg>
        </div>
    );
};