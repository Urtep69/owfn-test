
import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface SecurityPoint {
    icon: string;
    title: string;
    explanation: string;
}

export const AiSecurityPanel = () => {
    const [analysis, setAnalysis] = useState<SecurityPoint[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalysis = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch('/api/ai-security-check');
                if (!res.ok) {
                    throw new Error('Failed to fetch AI security analysis');
                }
                const data = await res.json();
                setAnalysis(data.analysis);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, []);

    return (
        <div className="bg-dextools-card border border-dextools-border rounded-md p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-dextools-accent-blue" />
                <h3 className="font-semibold text-dextools-text-primary">AI Security Analysis</h3>
            </div>
            <div className="flex-grow">
                {loading && (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-dextools-text-secondary" />
                    </div>
                )}
                {error && <div className="text-dextools-accent-red text-sm">{error}</div>}
                {analysis && (
                    <div className="space-y-3">
                        {analysis.map((point, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <span className="text-xl mt-px">{point.icon}</span>
                                <div>
                                    <p className="font-semibold text-sm text-dextools-text-primary">{point.title}</p>
                                    <p className="text-xs text-dextools-text-secondary">{point.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};