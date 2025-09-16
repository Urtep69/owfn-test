import React from 'react';
import { useCountUp } from '../hooks/useCountUp.js';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  formatter: (value: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 1500, className, formatter }) => {
  const count = useCountUp(value, duration);
  return <span className={className}>{formatter(count)}</span>;
};
