import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wallet, CheckCircle, Info, Gift, Loader2 } from 'lucide-react';

const ConnectWalletPrompt = () => {
    const { t, solana, setWalletModalOpen } = useAppContext();
    return (
        <div className="text-center p-12 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d max-w-lg mx-auto">
            <Wallet className="mx-auto w-16 h-16 text-accent-500 dark:text-darkAccent-500 mb-4" />
            <h2 className="text-2xl font-bold">{t('airdrop_title')}</h2>
            <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('airdrop_connect_prompt')}</p>
            <button
                onClick={() => setWalletModalOpen(true)}
                disabled={solana.loading}
                className="bg-accent-400 hover:bg-accent-500 text-accent-950 dark:bg-darkAccent-500 dark:hover:bg-darkAccent-600 dark:text-darkPrimary-950 font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50"
            >
                {solana.loading ? t('connecting') : t('connect_wallet')}
            </button>
        </div>
    );
};

const AirdropInterface = () => {
    const { t, solana } = useAppContext();
    const [status, setStatus] = useState<'loading' | 'form' | 'submitting' | 'submitted' | 'already_submitted' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const checkStatus = async () => {
            const { hasSubmitted } = await solana.checkAirdropStatus();
            if (hasSubmitted) {
                setStatus('already_submitted');
            } else {
                setStatus('form');
            }
        };
        checkStatus();
    }, [solana.checkAirdropStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim().length < 50) {
            alert(t('airdrop_message_too_short'));
            return;
        }
        setStatus('submitting');
        const result = await solana.submitAirdropMessage(message);
        if (result.success) {
            setStatus('submitted');
        } else {
            setStatus('error');
        }
    };

    if (status === 'loading') {
        return <div className="flex justify-center p-12"><Loader2 className="w-12 h-12 animate-spin text-accent-500" /></div>;
    }

    if (status === 'already_submitted' || status === 'submitted') {
        return (
             <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d max-w-2xl mx-auto text-center animate-fade-in-up">
                <CheckCircle className="mx-auto w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">{t('airdrop_submission_received')}</h2>
                <p className="text-primary-700 dark:text-darkPrimary-300 text-lg">
                    {t('airdrop_submission_thanks')}
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d max-w-2xl mx-auto animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-4">{t('airdrop_form_title')}</h2>
            <p className="text-primary-600 dark:text-darkPrimary-400 mb-6">{t('airdrop_form_desc')}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={t('airdrop_form_placeholder')}
                    rows={6}
                    required
                    minLength={50}
                    className="w-full p-3 bg-primary-100 dark:bg-darkPrimary-700 rounded-md focus:ring-2 focus:ring-accent-500 dark:focus:ring-darkAccent-500 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 rounded-lg text-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {status === 'submitting' && <Loader2 className="w-5 h-5 animate-spin" />}
                    {status === 'submitting' ? t('submitting') : t('airdrop_submit_button')}
                </button>
                {status === 'error' && <p className="text-red-500 text-center">{t('airdrop_submit_error')}</p>}
            </form>
        </div>
    );
};

export default function Airdrop() {
    const { t, solana } = useAppContext();

    return (
        <div className="animate-fade-in-up space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('airdrop_family_title')}</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('airdrop_family_desc')}
                </p>
            </div>

            <div className="bg-accent-100/30 dark:bg-darkAccent-900/30 border-l-4 border-accent-500 text-accent-800 dark:text-darkAccent-200 p-4 rounded-md shadow-md flex items-start space-x-3 max-w-3xl mx-auto">
                <Info className="h-6 w-6 text-accent-500 dark:text-darkAccent-500 flex-shrink-0 mt-0.5" />
                <p className="font-semibold">
                    {t('airdrop_selection_info')}
                </p>
            </div>
            
            {!solana.connected ? <ConnectWalletPrompt /> : <AirdropInterface />}
        </div>
    );
}