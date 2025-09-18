import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Token } from '../lib/types.js';
import { useAppContext } from '../contexts/AppContext.js';

interface PortfolioDonutChartProps {
    tokens: Token[];
}

const COLORS = ['#eac06a', '#b89b74', '#9e825c', '#846944', '#6a502c', '#503814', '#a8a29e', '#78716c'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-primary-50/80 dark:bg-darkPrimary-800/80 backdrop-blur-sm p-3 border border-primary-200 dark:border-darkPrimary-600 rounded-lg shadow-lg text-sm">
          <p className="font-bold text-primary-900 dark:text-darkPrimary-100">{data.name} ({data.symbol})</p>
          <p className="text-primary-700 dark:text-darkPrimary-300">Value: ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-primary-600 dark:text-darkPrimary-400">Balance: {data.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
        </div>
      );
    }
    return null;
};

export const PortfolioDonutChart: React.FC<PortfolioDonutChartProps> = ({ tokens }) => {
    const { t } = useAppContext();

    const chartData = tokens
        .filter(token => token.usdValue > 0.01) // Filter out dust
        .map(token => ({
            name: token.name,
            symbol: token.symbol,
            value: token.usdValue,
            balance: token.balance
        }))
        .sort((a, b) => b.value - a.value);

    // Group small values into "Other"
    const displayData = [];
    let otherValue = 0;
    if (chartData.length > COLORS.length) {
        for (let i = 0; i < chartData.length; i++) {
            if (i < COLORS.length - 1) {
                displayData.push(chartData[i]);
            } else {
                otherValue += chartData[i].value;
            }
        }
        displayData.push({ name: t('portfolio_chart_other_category'), symbol: 'OTHER', value: otherValue, balance: 0 });
    } else {
        displayData.push(...chartData);
    }
    
    if (displayData.length === 0) {
        return (
             <div className="flex items-center justify-center h-full text-primary-500 dark:text-darkPrimary-400">
                <p>{t('profile_no_tokens')}</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                 <Tooltip content={<CustomTooltip />} />
                 <Pie
                    data={displayData}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="symbol"
                    legendType="circle"
                >
                    {displayData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Legend 
                    iconSize={10} 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '12px', lineHeight: '20px' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};
