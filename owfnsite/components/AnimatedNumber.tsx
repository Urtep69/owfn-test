
import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
    value: number;
    formatter?: (value: number) => string;
}

const defaultFormatter = (value: number) => {
    // Format with commas, and show 2 decimal places only if needed.
    return value.toLocaleString(undefined, {
        minimumFractionDigits: value % 1 !== 0 ? 2 : 0,
        maximumFractionDigits: 2
    });
};

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, formatter = defaultFormatter }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const animationFrameRef = useRef<number | null>(null);
    const prevValueRef = useRef(0);

    useEffect(() => {
        const startValue = prevValueRef.current;
        const endValue = value;
        const duration = 1500; // Animation duration in ms
        let startTime: number | null = null;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            
            // Ease-out function for a smoother stop
            const easedPercentage = 1 - Math.pow(1 - percentage, 3);

            const currentValue = startValue + (endValue - startValue) * easedPercentage;
            
            setDisplayValue(currentValue);

            if (percentage < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setDisplayValue(endValue); // Ensure it ends on the exact value
                prevValueRef.current = endValue;
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            prevValueRef.current = value;
        };
    }, [value]);

    return <span>{formatter(displayValue)}</span>;
};
