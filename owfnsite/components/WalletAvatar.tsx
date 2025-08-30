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
    '#92400e', // accent-800
    '#78350f', // accent-900
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
        if (!address) return { bgColor: COLORS[0], shapes: [] };
        
        const hash = simpleHash(address);
        
        const bgColor = COLORS[hash % COLORS.length];
        
        const shapes = Array.from({ length: 3 }).map((_, i) => {
            const shapeHash = simpleHash(address.slice(i * 5, (i + 1) * 5));
            return {
                cx: 15 + (shapeHash % 70),
                cy: 15 + ((shapeHash >> 8) % 70),
                r: 10 + (shapeHash % 15),
                fill: COLORS[(shapeHash >> 16) % COLORS.length],
                opacity: 0.6 + ((shapeHash % 40) / 100)
            };
        });
        
        return { bgColor, shapes };
    }, [address]);

    return (
        <div className={`${className} rounded-full overflow-hidden`}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" fill={avatarData.bgColor} />
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