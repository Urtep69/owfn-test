import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Wallet, CheckCircle, XCircle, Gift, Loader2 } from 'lucide-react';

const MOCK_AIRDROP_AMOUNT = 5000;

const ConnectWalletPrompt = () => {
    const { t, solana, setWalletModalOpen } = useAppContext();
    return (
        <div className="text-center p-12 bg-dextools-card border border-dextools-border rounded-md max-w-md mx-auto">
            <Wallet className="mx-auto w-16 h-16 text-dextools-accent-blue mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-dextools-text-primary">{t('airdrop')}</h2>
            <p className="text-dextools-text-secondary mb-6">{t('airdrop_connect_prompt')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                disabled={solana.loading}
                className="bg-dextools-special text-white font-bold py-3 px-6 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
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

    useEffect(() => {
        if (solana.connected && solana.address) {
            setIsChecking(true);
            setEligibilityStatus('idle');
            setTimeout(() => {
                setEligibilityStatus('not_eligible');
                setIsChecking(false);
            }, 1500);
        }
    }, [solana.connected, solana.address]);


    return (
        <div className="bg-dextools-card border border-dextools-border p-8 rounded-md max-w-md mx-auto text-center">
            {isChecking && (
                <>
                    <Loader2 className="mx-auto w-16 h-16 text-dextools-accent-blue mb-4 animate-spin" />
                    <h2 className="text-2xl font-bold mb-2 text-dextools-text-primary">{t('airdrop_checking')}</h2>
                    <p className="text-dextools-text-secondary">{t('airdrop_subtitle')}</p>
                </>
            )}

            {!isChecking && eligibilityStatus === 'eligible' && (
                <div className="animate-fade-in">
                    <CheckCircle className="mx-auto w-16 h-16 text-dextools-accent-green mb-4" />
                    <h2 className="text-2xl font-bold text-dextools-accent-green mb-2">{t('airdrop_congratulations')}</h2>
                    <p className="text-dextools-text-primary text-lg">
                        {t('airdrop_eligible_message', { amount: MOCK_AIRDROP_AMOUNT.toLocaleString() })}
                    </p>
                </div>
            )}
             {!isChecking && eligibilityStatus === 'not_eligible' && (
                <div className="animate-fade-in">
                    <XCircle className="mx-auto w-16 h-16 text-dextools-accent-red mb-4" />
                    <h2 className="text-2xl font-bold text-dextools-accent-red mb-2">{t('airdrop_not_eligible')}</h2>
                    <p className="text-dextools-text-secondary">
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
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-dextools-accent-blue">{t('airdrop_title')}</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-dextools-text-secondary">{t('airdrop_subtitle')}</p>
            </div>
            
            {!solana.connected ? <ConnectWalletPrompt /> : <EligibilityChecker />}

            <div className="max-w-2xl mx-auto mt-12 p-6 bg-dextools-card border border-dextools-border rounded-md">
                <h3 className="text-xl font-bold mb-2 text-dextools-text-primary">{t('airdrop_info_box_title')}</h3>
                <p className="text-dextools-text-secondary">{t('airdrop_info_box_desc')}</p>
            </div>
        </div>
    );
}