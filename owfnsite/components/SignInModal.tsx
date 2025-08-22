import React from 'react';
import { X, ShieldCheck, Info } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
    const { t, solana } = useAppContext();
    const { signIn, isAuthLoading, address } = solana;

    const handleSignIn = async () => {
        const success = await signIn();
        if (success) {
            onClose();
        } else {
            alert("Signature failed or was rejected. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="glassmorphism w-full max-w-sm m-auto animate-fade-in-up rounded-2xl border border-border-color"
                style={{ animationDuration: '300ms' }}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-border-color">
                    <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <ShieldCheck className="text-accent" />
                        Verify Wallet Ownership
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-dark">
                        <X size={20} className="text-text-secondary" />
                    </button>
                </header>
                
                <div className="p-6 text-center space-y-4">
                    <p className="text-text-secondary">
                        To access your full profile and advanced features, please sign a message to prove you own this wallet.
                    </p>
                    <div className="bg-surface-dark p-3 rounded-lg text-sm text-text-secondary border border-border-color">
                        <p className="font-mono break-all">{address}</p>
                    </div>

                    <div className="text-xs text-text-secondary flex items-start gap-2 text-left p-3 bg-surface-dark rounded-lg">
                        <Info size={28} className="flex-shrink-0 mt-0.5" />
                        <span>This is a gas-free action and does not grant any permissions to move your funds. It's simply a cryptographic proof of ownership.</span>
                    </div>

                    <button 
                        onClick={handleSignIn}
                        disabled={isAuthLoading}
                        className="w-full bg-gradient-to-r from-accent to-accent-light text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isAuthLoading ? 'Waiting for signature...' : 'Sign and Verify'}
                    </button>
                </div>
            </div>
        </div>
    );
};