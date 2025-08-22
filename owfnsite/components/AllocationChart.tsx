import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TOKEN_ALLOCATIONS } from '../constants.ts';

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glassmorphism-dark p-2 border border-border-color rounded-lg shadow-lg text-text-primary">
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
            data={TOKEN_ALLOCATIONS}
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
          <Legend wrapperStyle={{ color: '#8b949e' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};