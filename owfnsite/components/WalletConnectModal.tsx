
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
    const { t } = useAppContext();
    const { wallets, select, connect } = useWallet();
    
    const handleWalletSelect = async (walletName: WalletName) => {
        try {
            select(walletName);
            // The connection is triggered by the wallet adapter's logic after selection,
            // especially with autoConnect. A slight delay can help ensure the adapter
            // has processed the selection before we attempt to connect.
            setTimeout(() => {
                connect().catch(error => {
                    console.error(`Failed to connect to ${walletName}:`, error);
                    // Optionally show an error message to the user
                });
            }, 100);
        } catch (error) {
            console.error(`Error selecting wallet ${walletName}:`, error);
        } finally {
            onClose();
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
                className="bg-white dark:bg-darkPrimary-800 rounded-2xl shadow-3d-lg w-full max-w-md m-auto animate-fade-in-up"
                style={{ animationDuration: '300ms' }}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-primary-200 dark:border-darkPrimary-700">
                    <h2 className="text-lg font-bold text-primary-900 dark:text-darkPrimary-100">{t('connect_wallet')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-primary-100 dark:hover:bg-darkPrimary-700">
                        <X size={20} className="text-primary-500 dark:text-darkPrimary-400" />
                    </button>
                </header>
                
                <div className="p-6 space-y-6">
                    {/* Easy Connect Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-primary-500 dark:text-darkPrimary-400 mb-2">Easy Connect (Recommended)</h3>
                         <div className="space-y-2">
                            {socialConnectors.map(connector => (
                                <button key={connector.name} disabled={connector.comingSoon} className="w-full flex items-center space-x-4 p-3 rounded-lg bg-primary-100 dark:bg-darkPrimary-700/50 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">{connector.icon}</div>
                                    <span className="font-semibold text-primary-800 dark:text-darkPrimary-200">{connector.name}</span>
                                    {connector.comingSoon && <span className="ml-auto text-xs font-bold text-accent-600 dark:text-darkAccent-500 bg-accent-100 dark:bg-darkAccent-900/50 px-2 py-1 rounded-full">{t('coming_soon_title')}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                     {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-primary-200 dark:border-darkPrimary-600"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-darkPrimary-800 px-2 text-sm text-primary-500 dark:text-darkPrimary-400">OR</span>
                        </div>
                    </div>

                    {/* Traditional Wallet Section */}
                    <div>
                         <h3 className="text-sm font-semibold text-primary-500 dark:text-darkPrimary-400 mb-2">Connect with a Wallet</h3>
                         <div className="space-y-2">
                            {wallets.filter(w => w.readyState === 'Installed').map(wallet => (
                                <button
                                    key={wallet.adapter.name}
                                    onClick={() => handleWalletSelect(wallet.adapter.name as WalletName)}
                                    className="w-full flex items-center space-x-4 p-3 rounded-lg bg-primary-100 dark:bg-darkPrimary-700/50 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"
                                >
                                     <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-full"/>
                                     <span className="font-semibold text-primary-800 dark:text-darkPrimary-200">{wallet.adapter.name}</span>
                                </button>
                            ))}
                         </div>
                    </div>
                </div>

                 <footer className="p-4 text-center text-xs text-primary-500 dark:text-darkPrimary-500 bg-primary-50 dark:bg-darkPrimary-800/50 border-t border-primary-200 dark:border-darkPrimary-700 rounded-b-2xl">
                    <p>By connecting, you agree to our Terms of Service.</p>
                </footer>
            </div>
        </div>
    );
};
