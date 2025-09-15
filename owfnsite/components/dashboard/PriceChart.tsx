
import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Mock data until the token is live on a DEX
const mockData = [
  { name: '12:00', price: 0.000000111 },
  { name: '13:00', price: 0.000000112 },
  { name: '14:00', price: 0.000000115 },
  { name: '15:00', price: 0.000000114 },
  { name: '16:00', price: 0.000000118 },
  { name: '17:00', price: 0.000000121 },
  { name: '18:00', price: 0.000000120 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dextools-background/80 backdrop-blur-sm p-2 border border-dextools-border rounded-md shadow-lg text-dextools-text-primary">
        <p className="text-sm">{`Time: ${label}`}</p>
        <p className="font-semibold">{`Price: $${payload[0].value.toPrecision(6)}`}</p>
      </div>
    );
  }
  return null;
};

export const PriceChart = () => {
    const [timeframe, setTimeframe] = useState('1D');
    const timeframes = ['1H', '4H', '1D', '7D', '1M'];

    return (
        <div className="bg-dextools-card border border-dextools-border rounded-md p-4 h-96 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-dextools-text-primary">OWFN/SOL Price Chart</h2>
                <div className="flex items-center bg-dextools-background rounded-md border border-dextools-border p-1">
                    {timeframes.map(tf => (
                        <button 
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 text-xs font-semibold rounded ${timeframe === tf ? 'bg-dextools-special text-white' : 'text-dextools-text-secondary hover:bg-dextools-border'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow text-dextools-text-secondary text-center flex items-center justify-center">
                 {/* This container will hold the chart once live data is available */}
                 <p>Live chart will be available after DEX listing.</p>
                {/* 
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                        <XAxis dataKey="name" stroke="#8B949E" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#8B949E" tick={{ fontSize: 12 }} domain={['dataMin', 'dataMax']} tickFormatter={(tick) => tick.toPrecision(3)} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="price" stroke="#58A6FF" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer> 
                */}
            </div>
        </div>
    );
};