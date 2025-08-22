import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Token } from '../types.ts';
import { useAppContext } from '../contexts/AppContext.tsx';

interface PortfolioChartProps {
    tokens: Token[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-primary-50/80 dark:bg-darkPrimary-800/80 backdrop-blur-sm p-2 border border-primary-200 dark:border-darkPrimary-600 rounded-lg shadow-lg text-primary-900 dark:text-darkPrimary-100">
                <p className="font-bold">{`${data.name} (${data.symbol})`}</p>
                <p className="text-sm">{`Value: $${data.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
                <p className="text-sm">{`Percentage: ${data.percentage.toFixed(2)}%`}</p>
            </div>
        );
    }
    return null;
};

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ tokens }) => {
    const { theme } = useAppContext();
    
    const chartData = React.useMemo(() => {
        const totalUsdValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);
        if (totalUsdValue === 0) return [];
        
        const colors = theme === 'dark' 
            ? ['#eac06a', '#b89b74', '#9e825c', '#f0d090', '#d2b48c', '#846944']
            : ['#fbbf24', '#d97706', '#b45309', '#f59e0b', '#a16207', '#92400e'];

        return tokens
            .filter(token => token.usdValue > 0)
            .map((token, index) => ({
                ...token,
                percentage: (token.usdValue / totalUsdValue) * 100,
                color: colors[index % colors.length]
            }));
    }, [tokens, theme]);

    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-primary-500 dark:text-darkPrimary-400">
                No token data to display.
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="usdValue"
                        nameKey="name"
                        paddingAngle={2}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                        iconType="circle" 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right" 
                        wrapperStyle={{ fontSize: '12px', color: 'var(--recharts-legend-text-color)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
