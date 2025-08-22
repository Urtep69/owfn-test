import React from 'react';

interface DualProgressBarProps {
  value1: number;
  label1: string;
  value2: number;
  label2: string;
  color1?: string;
  color2?: string;
  formatter?: (value: number) => string;
}

export const DualProgressBar: React.FC<DualProgressBarProps> = ({
  value1,
  label1,
  value2,
  label2,
  color1 = 'bg-success',
  color2 = 'bg-danger',
  formatter = (value) => value.toLocaleString(),
}) => {
  const total = value1 + value2;
  const percent1 = total > 0 ? (value1 / total) * 100 : 0;
  const percent2 = total > 0 ? 100 - percent1 : 0;

  if (total === 0) {
      return (
        <div>
          <div className="flex justify-between mb-1 text-sm font-medium text-text-secondary">
            <span>{label1}: {formatter(value1)} (0%)</span>
            <span>{label2}: {formatter(value2)} (0%)</span>
          </div>
          <div className="w-full bg-surface-light rounded-full h-4 flex overflow-hidden border border-border-color">
            <div className="bg-surface-dark h-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      );
  }

  return (
    <div>
      <div className="flex justify-between mb-1 text-sm font-medium">
        <span className="font-bold text-success">{label1}: {formatter(value1)} ({percent1.toFixed(1)}%)</span>
        <span className="font-bold text-danger">{label2}: {formatter(value2)} ({percent2.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-surface-light rounded-full h-4 flex overflow-hidden border border-border-color">
        <div className={`${color1} h-full transition-all duration-500`} style={{ width: `${percent1}%` }}></div>
        <div className={`${color2} h-full transition-all duration-500`} style={{ width: `${percent2}%` }}></div>
      </div>
    </div>
  );
};
