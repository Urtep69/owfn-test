import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, CheckCircle, XCircle, Gift, Loader2 } from 'lucide-react';

const MOCK_AIRDROP_AMOUNT = 5000;

const ConnectWalletPrompt = () => {
    const { t, solana, setWalletModalOpen } = useAppContext();
    return (
        <div className="text-center p-12 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg max-w-md mx-auto">
            <Wallet className="mx-auto w-16 h-16 text-primary-500 dark:text-primary-500 mb-4" />
            <h2 className="text-2xl font-bold">{t('airdrop')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{t('airdrop_connect_prompt')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                disabled={solana.loading}
                className="bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-md hover:shadow-glow-primary"
            >
                {solana.loading ? t('connecting') : t('connect_wallet')}
            </button>
        </div>
    );
};

const EligibilityChecker = () => {
    const { t, solana } = useAppContext();
    const [isChecking, setIsChecking] = useState(true);
    const [eligibilityStatus, setEligibilityStatus] = useState<'idle' | 'eligible' | 'not_eligible'>('idle');

    const handleCheckEligibility = () => {
        setIsChecking(true);
        setEligibilityStatus('idle');

        setTimeout(() => {
            // This is a placeholder for a real eligibility check API call.
            // For now, we simulate a "not eligible" status for any connected wallet.
            setEligibilityStatus('not_eligible');
            setIsChecking(false);
        }, 1500); // Simulate network request
    };
    
    useEffect(() => {
        if (solana.connected && solana.address) {
            handleCheckEligibility();
        }
    }, [solana.connected, solana.address]);


    return (
        <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg max-w-md mx-auto text-center">
            {isChecking && (
                <>
                    <Loader2 className="mx-auto w-16 h-16 text-primary-500 dark:text-primary-500 mb-4 animate-spin" />
                    <h2 className="text-2xl font-bold mb-2">{t('airdrop_checking')}</h2>
                    <p className="text-slate-600 dark:text-slate-400">{t('airdrop_subtitle')}</p>
                </>
            )}

            {!isChecking && eligibilityStatus === 'eligible' && (
                <div className="animate-fade-in-up">
                    <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-green-500 dark:text-green-400 mb-2">{t('airdrop_congratulations')}</h2>
                    <p className="text-slate-700 dark:text-slate-300 text-lg">
                        {t('airdrop_eligible_message', { amount: MOCK_AIRDROP_AMOUNT.toLocaleString() })}
                    </p>
                </div>
            )}
             {!isChecking && eligibilityStatus === 'not_eligible' && (
                <div className="animate-fade-in-up">
                    <XCircle className="mx-auto w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-red-500 dark:text-red-400 mb-2">{t('airdrop_not_eligible')}</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t('airdrop_not_eligible_message')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default function Airdrop() {
    const { t, solana } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400">{t('airdrop_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
                    {t('airdrop_subtitle')}
                </p>
            </div>
            
            {!solana.connected ? <ConnectWalletPrompt /> : <EligibilityChecker />}

            <div className="max-w-2xl mx-auto mt-12 p-6 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <h3 className="text-xl font-bold mb-2">{t('airdrop_info_box_title')}</h3>
                <p className="text-slate-600 dark:text-slate-400">
                    {t('airdrop_info_box_desc')}
                </p>
            </div>
        </div>
    );
}