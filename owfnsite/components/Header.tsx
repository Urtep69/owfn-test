import React from 'react';
import { Menu, X, LogOut, Wallet, ShieldCheck } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const ConnectButton = () => {
    const { t, setWalletModalOpen, solana, setSignInModalOpen } = useAppContext();
    const { connected, isAuthenticated, address, disconnectWallet, isAuthLoading } = solana;

    const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    if (isAuthenticated && address) {
        return (
             <div className="flex items-center space-x-2 bg-surface-light rounded-lg">
                <div
                    className="flex items-center space-x-2 pl-3 pr-2 py-2 text-text-primary"
                >
                    <Wallet size={18} className="text-success" />
                    <span className="font-semibold text-sm font-mono">{truncateAddress(address)}</span>
                </div>
                 <button
                    onClick={() => disconnectWallet()}
                    className="p-2 text-text-secondary hover:text-danger hover:bg-surface-dark rounded-r-lg transition-colors"
                    aria-label={t('disconnect_wallet')}
                >
                    <LogOut size={18} />
                </button>
            </div>
        );
    }

    if (connected && !isAuthenticated) {
         return (
            <button
                onClick={() => setSignInModalOpen(true)}
                disabled={isAuthLoading}
                className="bg-warning text-black font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors flex items-center gap-2"
            >
                <ShieldCheck size={18} />
                {isAuthLoading ? t('processing') : 'Verify Wallet'}
            </button>
        );
    }
    
    return (
        <button
            onClick={() => setWalletModalOpen(true)}
            className="bg-accent-light text-accent-foreground font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition-colors"
        >
            {t('connect_wallet')}
        </button>
    );
};


export const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="glassmorphism sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-text-secondary hover:bg-surface-light focus:outline-none"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};