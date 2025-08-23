import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, CheckCircle, XCircle, Gift, Loader2 } from 'lucide-react';

const MOCK_AIRDROP_AMOUNT = 5000;

const ConnectWalletPrompt = () => {
    const { t, solana, setWalletModalOpen } = useAppContext();
    return (
        <div className="text-center p-12 glass-card max-w-md mx-auto card-3d-hover">
            <Wallet className="mx-auto w-16 h-16 text-neon-cyan mb-4" />
            <h2 className="text-2xl font-bold">{t('airdrop')}</h2>
            <p className="text-text-secondary mb-6">{t('airdrop_connect_prompt')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                disabled={solana.loading}
                className="font-bold py-3 px-6 rounded-full text-lg neon-button disabled:opacity-50"
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
        <div className="glass-card p-8 rounded-lg max-w-md mx-auto text-center card-3d-hover">
            {isChecking && (
                <>
                    <Loader2 className="mx-auto w-16 h-16 text-neon-cyan mb-4 animate-spin" />
                    <h2 className="text-2xl font-bold mb-2">{t('airdrop_checking')}</h2>
                    <p className="text-text-secondary">{t('airdrop_subtitle')}</p>
                </>
            )}

            {!isChecking && eligibilityStatus === 'eligible' && (
                <div className="animate-fade-in-up">
                    <CheckCircle className="mx-auto w-16 h-16 text-green-400 mb-4" />
                    <h2 className="text-2xl font-bold text-green-400 mb-2">{t('airdrop_congratulations')}</h2>
                    <p className="text-text-primary text-lg">
                        {t('airdrop_eligible_message', { amount: MOCK_AIRDROP_AMOUNT.toLocaleString() })}
                    </p>
                </div>
            )}
             {!isChecking && eligibilityStatus === 'not_eligible' && (
                <div className="animate-fade-in-up">
                    <XCircle className="mx-auto w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-red-500 mb-2">{t('airdrop_not_eligible')}</h2>
                    <p className="text-text-secondary">
                        {t('airdrop_not_eligible_message')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default function Airdrop() {
    const { t, solana, isVerified } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-text-primary" style={{ textShadow: '0 0 10px var(--neon-cyan)' }}>{t('airdrop_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">
                    {t('airdrop_subtitle')}
                </p>
            </div>
            
            {!solana.connected || !isVerified ? <ConnectWalletPrompt /> : <EligibilityChecker />}

            <div className="max-w-2xl mx-auto mt-12 p-6 glass-card card-3d-hover">
                <h3 className="text-xl font-bold mb-2 text-text-primary">{t('airdrop_info_box_title')}</h3>
                <p className="text-text-secondary">
                    {t('airdrop_info_box_desc')}
                </p>
            </div>
        </div>
    );
}