import React, { useMemo } from 'react';

interface WalletAvatarProps {
    address: string;
    className?: string;
}

const COLORS = [
    '#22d3ee', // primary
    '#fbbf24', // secondary
    '#38bdf8', // sky-400
    '#a78bfa', // violet-400
    '#34d399', // emerald-400
    '#f472b6', // pink-400
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

export const WalletAvatar: React.FC<WalletAvatarProps> = ({ address, className = 'w-16 h-16' }) => {
    const svgData = useMemo(() => {
        if (!address) return { bg: COLORS[0], shapes: [] };
        
        const hash = simpleHash(address);
        
        // Use the first part of the hash for the background gradient
        const bg_color1 = COLORS[hash % COLORS.length];
        const bg_color2 = COLORS[(hash + 1) % COLORS.length];

        const shapes = Array.from({ length: 4 }).map((_, i) => {
            const part = address.slice(i * 10, (i + 1) * 10);
            const shapeHash = simpleHash(part);
            
            return {
                cx: 15 + (shapeHash % 70),
                cy: 15 + ((shapeHash * 3) % 70),
                r: 5 + ((shapeHash >> 8) % 15),
                fill: COLORS[(shapeHash >> 4) % COLORS.length],
                opacity: 0.7 + (((shapeHash >> 12) % 30) / 100), // 0.7 to 1.0
            };
        });
        
        return { bg_color1, bg_color2, shapes, rotation: hash % 360 };
    }, [address]);

    return (
        <div className={`${className} rounded-full overflow-hidden border-2 border-border`}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`Avatar for wallet ${address}`}>
                <defs>
                    <linearGradient id={`grad-${address.slice(0, 6)}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: svgData.bg_color1, stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor: svgData.bg_color2, stopOpacity:1}} />
                    </linearGradient>
                </defs>
                <rect width="100" height="100" fill={`url(#grad-${address.slice(0, 6)})`} />
                 <g transform={`rotate(${svgData.rotation} 50 50)`}>
                    {svgData.shapes.map((shape, i) => (
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