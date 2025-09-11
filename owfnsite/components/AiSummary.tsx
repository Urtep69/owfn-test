import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

interface AiSummaryProps {
    contentId: string;
}

export const AiSummary: React.FC<AiSummaryProps> = ({ contentId }) => {
    const { t, currentLanguage } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSummarize = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSummary(null);

        const contentElement = document.getElementById(contentId);
        if (!contentElement) {
            setError("Content element not found.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: contentElement.innerText, langName: currentLanguage.name }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch summary');
            }
            
            const data = await response.json();
            setSummary(data.summary);

        } catch (err) {
            setError(t('api_error_generic', { defaultValue: "Could not generate summary. Please try again later." }));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [contentId, currentLanguage.name, t]);

    return (
        <div className="mb-8 animate-fade-in-up">
            <button
                onClick={handleSummarize}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-100 dark:bg-darkAccent-900/50 border border-accent-400/30 dark:border-darkAccent-500/30 text-accent-700 dark:text-darkAccent-200 font-semibold rounded-lg hover:bg-accent-200/50 dark:hover:bg-darkAccent-900 transition-colors disabled:opacity-50"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('ai_summary_loading')}
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        {t('ai_summary_button')}
                    </>
                )}
            </button>
            
            {summary && (
                 <div className="mt-4 p-6 bg-primary-50 dark:bg-darkPrimary-950 border-l-4 border-accent-500 dark:border-darkAccent-500 rounded-r-lg shadow-md animate-fade-in-up" style={{ animationDuration: '300ms' }}>
                    <h3 className="text-xl font-bold font-serif mb-3">{t('ai_summary_title')}</h3>
                    <div className="prose dark:prose-invert max-w-none text-primary-700 dark:text-darkPrimary-300 whitespace-pre-wrap">
                        {summary.split('\n').map((line, index) => (
                            <p key={index} className="my-1">{line}</p>
                        ))}
                    </div>
                     <p className="text-xs text-primary-500 dark:text-darkPrimary-500 mt-4 italic">{t('generated_by_ai')}</p>
                </div>
            )}
            {error && (
                 <div className="mt-4 p-4 bg-red-500/10 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <p>{error}</p>
                 </div>
            )}
        </div>
    );
};