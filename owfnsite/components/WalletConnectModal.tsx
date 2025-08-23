import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { X, ExternalLink, Mail, KeyRound, Radio } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const socialConnectors = [
    { name: 'Google', icon: <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />,comingSoon: true },
    { name: 'X / Twitter', icon: <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path></svg>, comingSoon: true },
    { name: 'Email', icon: <Mail size={22} />, comingSoon: true },
]

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
    const { t, setSignatureRequired } = useAppContext();
    const { wallets, select, connect } = useWallet();
    
    const handleWalletSelect = async (walletName: WalletName) => {
        try {
            select(walletName);
            // The connect() promise resolves when the wallet is connected.
            await connect();
            // After successful connection, close this modal and trigger the signature request.
            onClose();
            setSignatureRequired(true);
        } catch (error) {
            console.error(`Failed to connect to ${walletName}:`, error);
            // Optionally show an error message to the user
            onClose(); // Close even on error
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="glass-card w-full max-w-md m-auto animate-fade-in-up text-text-primary"
                style={{ animationDuration: '300ms' }}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-dark-border">
                    <h2 className="text-lg font-bold">{t('connect_wallet')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-card">
                        <X size={20} className="text-text-secondary" />
                    </button>
                </header>
                
                <div className="p-6 space-y-6">
                    {/* Easy Connect Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-text-secondary mb-2">Easy Connect (Recommended)</h3>
                         <div className="space-y-2">
                            {socialConnectors.map(connector => (
                                <button key={connector.name} disabled={connector.comingSoon} className="w-full flex items-center space-x-4 p-3 rounded-lg bg-dark-card border border-dark-border hover:border-neon-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed group">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">{connector.icon}</div>
                                    <span className="font-semibold text-text-primary">{connector.name}</span>
                                    {connector.comingSoon && <span className="ml-auto text-xs font-bold text-neon-magenta bg-dark-card px-2 py-1 rounded-full">{t('coming_soon_title')}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                     {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-dark-border"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-dark-card px-2 text-sm text-text-secondary">OR</span>
                        </div>
                    </div>

                    {/* Traditional Wallet Section */}
                    <div>
                         <h3 className="text-sm font-semibold text-text-secondary mb-2">Connect with a Wallet</h3>
                         <div className="space-y-2">
                            {wallets.filter(w => w.readyState === 'Installed').map(wallet => (
                                <button
                                    key={wallet.adapter.name}
                                    onClick={() => handleWalletSelect(wallet.adapter.name as WalletName)}
                                    className="w-full flex items-center space-x-4 p-3 rounded-lg bg-dark-card border border-dark-border hover:border-neon-cyan transition-colors"
                                >
                                     <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-full"/>
                                     <span className="font-semibold text-text-primary">{wallet.adapter.name}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                </div>

                 <footer className="p-4 text-center text-xs text-text-secondary bg-dark-bg border-t border-dark-border rounded-b-2xl">
                    <p>By connecting, you agree to our Terms of Service.</p>
                </footer>
            </div>
        </div>
    );
};