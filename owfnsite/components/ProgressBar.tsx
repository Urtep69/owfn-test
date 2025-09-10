


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
        <span className="text-base font-medium text-slate-800 dark:text-slate-200">{label}</span>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{clampedProgress.toFixed(2)}%</span>
      </div>}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
        <div
          className="bg-gradient-to-r from-primary-500 to-primary-400 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};