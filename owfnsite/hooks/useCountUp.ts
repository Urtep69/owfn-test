import { useState, useEffect, useRef } from 'react';

const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const useCountUp = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  // FIX: Provide an initial value (null) to useRef to fix "Expected 1 arguments, but got 0" error.
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end < 0) { // Also handle initial state for non-positive numbers
        setCount(end);
        return;
    }
    
    startTimeRef.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);
      const easedPercentage = easeOutExpo(percentage);
      
      const currentCount = easedPercentage * end;
      setCount(currentCount);

      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);

  return count;
};