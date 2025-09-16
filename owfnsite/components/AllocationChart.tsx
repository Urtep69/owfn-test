
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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
  

export const AllocationChart = () => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            // FIX: Cast TOKEN_ALLOCATIONS to 'any' to satisfy Recharts' flexible data prop type,
            // which expects a generic object array with an index signature that TokenAllocation lacks.
            data={TOKEN_ALLOCATIONS as any}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {TOKEN_ALLOCATIONS.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: 'var(--recharts-legend-text-color)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
