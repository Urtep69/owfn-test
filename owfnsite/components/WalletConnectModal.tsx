import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { WalletName } from '@solana/wallet-adapter-base';
import { X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
    const { t } = useAppContext();
    const { wallets, select, connect } = useWallet();
    
    const handleWalletSelect = async (walletName: WalletName) => {
        try {
            select(walletName);
            setTimeout(() => {
                connect().catch(error => {
                    console.error(`Failed to connect to ${walletName}:`, error);
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
                className="glassmorphism w-full max-w-sm m-auto animate-fade-in-up rounded-2xl border border-border-color"
                style={{ animationDuration: '300ms' }}
                onClick={e => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-border-color">
                    <h2 className="text-lg font-bold text-text-primary">{t('connect_wallet')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-2 transition-colors">
                        <X size={20} className="text-text-secondary" />
                    </button>
                </header>
                
                <div className="p-6 space-y-4">
                     <div className="space-y-2">
                        {wallets.filter(w => w.readyState === 'Installed').map(wallet => (
                            <button
                                key={wallet.adapter.name}
                                onClick={() => handleWalletSelect(wallet.adapter.name as WalletName)}
                                className="w-full flex items-center space-x-4 p-3 rounded-lg bg-surface-2 hover:bg-surface-3 transition-colors"
                            >
                                 <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-full"/>
                                 <span className="font-semibold text-text-primary">{wallet.adapter.name}</span>
                            </button>
                        ))}
                     </div>
                </div>

                 <footer className="p-4 text-center text-xs text-text-secondary bg-surface-1/50 border-t border-border-color rounded-b-2xl">
                    <p>By connecting, you agree to our Terms of Service.</p>
                </footer>
            </div>
        </div>
    );
};