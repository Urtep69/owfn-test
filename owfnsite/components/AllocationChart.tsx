import React, { useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { TOKEN_ALLOCATIONS } from '../lib/constants.js';

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-primary-50/80 dark:bg-darkPrimary-800/80 backdrop-blur-sm p-2 border border-primary-200 dark:border-darkPrimary-600 rounded-lg shadow-lg text-primary-900 dark:text-darkPrimary-100">
          <p className="font-bold">{`${payload[0].name}`}</p>
          <p className="text-sm">{`Amount: ${payload[0].value.toLocaleString()} OWFN`}</p>
          <p className="text-sm">{`Percentage: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="transition-all duration-300"
      />
    </g>
  );
};
  

export const AllocationChart = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, [setActiveIndex]);
  
  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, [setActiveIndex]);

  // FIX: The 'activeIndex' prop is not recognized by the project's version of Recharts' TypeScript types, causing a type error.
  // We are creating a props object and casting it to 'any' to bypass this check while preserving functionality.
  // Also correcting the value to pass `undefined` when no slice is active.
  const pieActiveProps: any = {
    activeIndex: activeIndex === null ? undefined : activeIndex,
    activeShape: renderActiveShape,
    onMouseEnter: onPieEnter,
    onMouseLeave: onPieLeave,
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            // FIX: Cast TOKEN_ALLOCATIONS to 'any' to satisfy Recharts' flexible data prop type.
            data={TOKEN_ALLOCATIONS as any}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={80}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            {...pieActiveProps}
          >
            {TOKEN_ALLOCATIONS.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--background-color)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: 'var(--recharts-legend-text-color)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
