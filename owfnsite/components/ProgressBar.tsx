

import React from 'react';

interface ProgressBarProps {
  progress: number; // A value between 0 and 100
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {label && <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-text-primary">{label}</span>
        <span className="text-sm font-medium text-text-primary">{clampedProgress.toFixed(2)}%</span>
      </div>}
      <div className="w-full bg-surface-2 rounded-full h-4">
        <div
          className="bg-gradient-to-r from-accent to-accent-hover h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};