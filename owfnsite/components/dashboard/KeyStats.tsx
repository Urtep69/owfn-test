
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { OWFN_MINT_ADDRESS } from '../../lib/constants.js';
import type { TokenDetails } from '../../lib/types.js';

const StatItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex flex-col">
        <span className="text-xs text-dextools-text-secondary uppercase">{label}</span>
        <span className="text-lg font-semibold text-dextools-text-primary">{value}</span>
    </div>
);

export const KeyStats = () => {
    const [stats, setStats] = useState<Partial<TokenDetails> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/token-info?mint=${OWFN_MINT_ADDRESS}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch token stats');
                }
                const data = await res.json();
                setStats(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatNumber = (num: number | undefined | null, options: Intl.NumberFormatOptions = {}) => {
        if (num === null || num === undefined) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 2,
            ...options
        }).format(num);
    }
    
    const formatPrice = (price: number | undefined | null) => {
        if (price === null || price === undefined) return 'N/A';
        return `$${price.toPrecision(6)}`;
    }

    if (loading) {
        return (
            <div className="h-24 bg-dextools-card border border-dextools-border rounded-md flex justify-center items-center">
                <Loader2 className="w-6 h-6 animate-spin text-dextools-text-secondary" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="h-24 bg-dextools-card border border-dextools-border rounded-md flex justify-center items-center text-dextools-accent-red">
                Error loading stats.
            </div>
        );
    }

    return (
        <div className="bg-dextools-card border border-dextools-border rounded-md p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem label="Price" value={formatPrice(stats.pricePerToken)} />
                <StatItem label="Market Cap" value={`$${formatNumber(stats.marketCap)}`} />
                <StatItem label="Total Supply" value={formatNumber(stats.totalSupply)} />
                <StatItem label="Holders" value={formatNumber(stats.holders, {notation: 'standard'})} />
            </div>
        </div>
    );
};