import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Mock data to simulate price movement until the token is live on a DEX
const mockData = [
  { time: '12:00', price: 0.000000148 },
  { time: '13:00', price: 0.000000150 },
  { time: '14:00', price: 0.000000155 },
  { time: '15:00', price: 0.000000152 },
  { time: '16:00', price: 0.000000158 },
  { time: '17:00', price: 0.000000161 },
  { time: '18:00', price: 0.000000159 },
  { time: '19:00', price: 0.000000165 },
  { time: '20:00', price: 0.000000163 },
  { time: '21:00', price: 0.000000168 },
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
                <div className="absolute z-10 p-4 bg-dextools-card/50 backdrop-blur-sm rounded-md">
                    <p className="font-semibold text-dextools-text-primary">Live chart will be available after DEX listing.</p>
                    <p className="text-xs">(Demonstration chart is shown)</p>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#58A6FF" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#58A6FF" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#30363D" strokeOpacity={0.5} />
                        <XAxis dataKey="time" stroke="#8B949E" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#8B949E" tick={{ fontSize: 12 }} domain={['dataMin * 0.999', 'dataMax * 1.001']} tickFormatter={(tick) => typeof tick === 'number' ? tick.toPrecision(3) : tick} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="price" stroke="#58A6FF" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                </ResponsiveContainer> 
            </div>
        </div>
    );
};