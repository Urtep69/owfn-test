import React, { useState, useEffect, useRef } from 'react';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import type { LiveTransaction } from '../types.ts';
import { AddressDisplay } from './AddressDisplay.tsx';

interface LiveTransactionFeedProps {
    pairAddress?: string;
}

// Mock data generator for demonstration purposes
const generateMockTransaction = (): LiveTransaction => {
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = 0.00000015 + (Math.random() - 0.5) * 0.00000005;
    const amount = Math.random() * 50000000;
    const maker = `Mkr${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`;
    
    return {
        id: `tx_${Date.now()}_${Math.random()}`,
        time: new Date().toLocaleTimeString(),
        type,
        price,
        amount,
        maker: maker,
        totalUsd: price * amount,
    };
};

export const LiveTransactionFeed: React.FC<LiveTransactionFeedProps> = ({ pairAddress }) => {
    const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!pairAddress) return;

        // In a real app, you would connect to a real WebSocket endpoint.
        // For this demo, we simulate a connection and generate mock data.
        setIsConnected(true);
        console.log("Simulating WebSocket connection for LiveTransactionFeed.");
        
        const interval = setInterval(() => {
            setTransactions(prev => [generateMockTransaction(), ...prev.slice(0, 49)]);
        }, 2500); // Add a new transaction every 2.5 seconds

        return () => {
            clearInterval(interval);
            setIsConnected(false);
            console.log("Simulated WebSocket connection closed.");
        };

    }, [pairAddress]);

    return (
        <div className="glassmorphism p-6 rounded-lg shadow-card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-text-primary font-display">
                    <ArrowRightLeft /> Live Trades
                </h3>
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-danger'}`}></div>
                    <span className="text-xs text-text-secondary font-semibold">{isConnected ? 'LIVE' : 'DISCONNECTED'}</span>
                </div>
            </div>
            <div className="overflow-x-auto max-h-96 relative">
                <table className="w-full text-sm text-left">
                     <thead className="text-xs text-text-secondary uppercase bg-surface-dark sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-2">Time</th>
                            <th scope="col" className="px-4 py-2">Type</th>
                            <th scope="col" className="px-4 py-2 text-right">Price USD</th>
                            <th scope="col" className="px-4 py-2 text-right">Amount</th>
                            <th scope="col" className="px-4 py-2 text-right">Total USD</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color/50">
                        {transactions.length > 0 ? transactions.map(tx => (
                            <tr key={tx.id} className="hover:bg-surface-dark/50">
                                <td className="px-4 py-2 font-mono text-text-secondary">{tx.time}</td>
                                <td className={`px-4 py-2 font-bold ${tx.type === 'buy' ? 'text-success' : 'text-danger'}`}>
                                    {tx.type.toUpperCase()}
                                </td>
                                <td className="px-4 py-2 text-right font-mono">${tx.price.toExponential(2)}</td>
                                <td className="px-4 py-2 text-right font-mono">{(tx.amount / 1_000_000).toFixed(2)}M</td>
                                <td className="px-4 py-2 text-right font-mono">${tx.totalUsd?.toFixed(2)}</td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-text-secondary">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Awaiting first transaction...</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
