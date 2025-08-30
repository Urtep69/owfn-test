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
    '#eac06a', // darkAccent-400
    '#d2b48c', // darkAccent-500
];

// Simple hashing function to get a number from a string
const simpleHash = (str: string): number => {
    let hash = 0;
    if (!str || str.length === 0) {
        return hash;
    }
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export const WalletAvatar: React.FC<WalletAvatarProps> = ({ address, className = 'w-10 h-10' }) => {
    const avatarData = useMemo(() => {
        if (!address) return { bgColor: COLORS[0], shapes: [] };
        
        const hash = simpleHash(address);
        
        const bgColor = COLORS[hash % COLORS.length];
        
        // Use a different set of colors for shapes to ensure contrast
        const shapeColors = COLORS.filter(c => c !== bgColor);
        
        const shapes = Array.from({ length: 4 }).map((_, i) => {
            // Use different parts of the address for more variation
            const part = address.slice(i * 8, (i + 1) * 8 + 4);
            const shapeHash = simpleHash(part);
            
            return {
                cx: 10 + (shapeHash % 80),
                cy: 10 + ((shapeHash >> 8) & 0xFF) % 80,
                r: 8 + ((shapeHash >> 16) & 0xFF) % 12,
                fill: shapeColors[((shapeHash >> 24) & 0xFF) % shapeColors.length],
                opacity: 0.5 + (((shapeHash >> 4) & 0xFF) % 50) / 100, // 0.5 to 1.0
            };
        });
        
        return { bgColor, shapes };
    }, [address]);

    return (
        <div className={`${className} rounded-full overflow-hidden shadow-inner`}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`Avatar for wallet ${address}`}>
                <rect width="100" height="100" fill={avatarData.bgColor} />
                <g transform={`rotate(${simpleHash(address.slice(0, 5)) % 360} 50 50)`}>
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
                </g>
            </svg>
        </div>
    );
};