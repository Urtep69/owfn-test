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
  color1 = 'bg-secondary',
  color2 = 'bg-destructive',
  formatter = (value) => value.toLocaleString(),
}) => {
  const total = value1 + value2;
  const percentage1 = total > 0 ? (value1 / total) * 100 : 50;

  return (
    <div className="w-full my-2">
      <div className="flex justify-between items-center mb-1 text-sm font-bold">
        <span className="text-secondary">{label1}</span>
        <span className="text-destructive">{label2}</span>
      </div>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-border">
        <div className={color1} style={{ width: `${percentage1}%` }}></div>
        <div className={color2} style={{ width: `${100 - percentage1}%` }}></div>
      </div>
      <div className="flex justify-between items-center mt-1 text-base font-semibold text-text-primary font-mono">
        <span>{formatter(value1)}</span>
        <span>{formatter(value2)}</span>
      </div>
    </div>
  );
};
