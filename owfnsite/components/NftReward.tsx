import React, { useState, useCallback } from 'react';
import { Gift, Image as ImageIcon, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

interface NftRewardProps {
    caseTitle: string;
    donationAmountUsd: number;
}

// Set a threshold for what constitutes a "significant" donation to unlock this feature.
const SIGNIFICANT_DONATION_THRESHOLD_USD = 150; 

export const NftReward: React.FC<NftRewardProps> = ({ caseTitle, donationAmountUsd }) => {
    const { t } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isEligible = donationAmountUsd >= SIGNIFICANT_DONATION_THRESHOLD_USD;

    const handleGenerate = useCallback(async () => {
        if (!isEligible) return;
        
        setIsLoading(true);
        setError(null);
        setImageUrl(null);

        try {
            const prompt = `A beautiful digital art piece representing hope and gratitude for a donation to the cause: '${caseTitle}'. The style should be heartwarming and inspiring, with warm, vibrant colors.`;
            
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }
            
            const data = await response.json();
            if (data.image) {
                setImageUrl(`data:image/jpeg;base64,${data.image}`);
            } else {
                throw new Error('No image data received');
            }

        } catch (err) {
            setError(t('api_error_generic'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [caseTitle, isEligible, t]);
    
    if (!isEligible) {
        return (
             <div className="mt-6 text-center bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                <p className="font-semibold text-primary-700 dark:text-darkPrimary-300 flex items-center justify-center gap-2">
                    <Gift size={18} /> {t('nft_reward_significant_donation_prompt', { threshold: SIGNIFICANT_DONATION_THRESHOLD_USD })}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6 p-6 bg-accent-100/30 dark:bg-darkAccent-900/30 border-t-2 border-accent-400 dark:border-darkAccent-500 rounded-b-lg text-center space-y-4">
             <h3 className="text-xl font-bold text-accent-700 dark:text-darkAccent-200">{t('nft_reward_title')}</h3>
             <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full max-w-xs bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 rounded-lg text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
             >
                {isLoading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
                {t('nft_reward_button')}
             </button>

             {isLoading && (
                <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t('nft_reward_loading')}</p>
             )}

             {error && (
                 <div className="p-3 bg-red-500/10 text-red-700 dark:text-red-300 rounded-lg flex items-center justify-center gap-2">
                    <AlertTriangle size={16} />
                    <p className="text-sm">{error}</p>
                 </div>
             )}
             
             {imageUrl && (
                 <div className="animate-fade-in-up">
                    <img src={imageUrl} alt="AI-generated thank you art" className="rounded-lg shadow-lg mx-auto w-full max-w-sm" />
                    <p className="text-xs text-primary-500 dark:text-darkPrimary-500 mt-2 italic flex items-center justify-center gap-1">
                        <Sparkles size={12} />
                        {t('generated_by_ai')}
                    </p>
                 </div>
             )}
        </div>
    );
};