
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
  color1 = 'bg-green-500',
  color2 = 'bg-red-500',
  formatter = (value) => value.toLocaleString(),
}) => {
  const total = value1 + value2;
  const percentage1 = total > 0 ? (value1 / total) * 100 : 50;

  return (
    <div className="w-full my-2">
      <div className="flex justify-between items-center mb-1 text-sm font-bold text-primary-800 dark:text-darkPrimary-200">
        <span className="text-green-600 dark:text-green-400">{label1}</span>
        <span className="text-red-600 dark:text-red-400">{label2}</span>
      </div>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-primary-200 dark:bg-darkPrimary-700">
        <div className={color1} style={{ width: `${percentage1}%` }}></div>
        <div className={color2} style={{ width: `${100 - percentage1}%` }}></div>
      </div>
      <div className="flex justify-between items-center mt-1 text-base font-semibold text-primary-900 dark:text-darkPrimary-100 font-mono">
        <span>{formatter(value1)}</span>
        <span>{formatter(value2)}</span>
      </div>
    </div>
  );
};