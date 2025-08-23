import React, { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose }) => {
    const { t, solana, setIsVerified } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignMessage = async () => {
        setIsLoading(true);
        setError('');
        const message = `Sign this message to verify you are the owner of this wallet and to continue to OWFN.\n\nTimestamp: ${Date.now()}`;
        try {
            const signature = await solana.signMessage(message);
            if (signature) {
                // In a real app, you'd send the signature and message to a backend for verification.
                // For this client-side implementation, a successful signature is enough proof.
                setIsVerified(true);
                onClose();
            } else {
                setError('Signature was cancelled or failed.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during signing.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="glass-card w-full max-w-sm m-auto animate-fade-in-up text-center p-8"
                style={{ animationDuration: '300ms' }}
            >
                <ShieldCheck className="mx-auto w-16 h-16 text-neon-cyan mb-4" style={{filter: 'drop-shadow(0 0 10px var(--neon-cyan))'}} />
                <h2 className="text-2xl font-bold text-text-primary mb-2">Verify Wallet Ownership</h2>
                <p className="text-text-secondary mb-6 text-sm">To ensure security, please sign a message with your wallet to prove you own this address. This is a free action and will not cost any gas fees.</p>
                
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

                <button
                    onClick={handleSignMessage}
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 font-bold py-3 px-6 rounded-full text-lg neon-button disabled:opacity-50 disabled:cursor-wait"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            <span>Waiting for signature...</span>
                        </>
                    ) : (
                        <span>Sign & Verify</span>
                    )}
                </button>
                 <p className="text-xs text-text-secondary mt-4">This confirms your identity for the current session.</p>
            </div>
        </div>
    );
};