import React from 'react';
import { Menu, X, LogOut, Wallet, Star } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const ConnectButton = () => {
    const { t, setWalletModalOpen, solana } = useAppContext();
    const { connected, publicKey, disconnect } = useWallet();

    const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    if (connected && publicKey) {
        return (
             <div className="flex items-center space-x-2 bg-primary-100/50 dark:bg-darkPrimary-900/50 rounded-full border border-primary-200 dark:border-darkPrimary-700 p-1">
                <div className="flex items-center space-x-2 pl-3 text-sm text-accent-600 dark:text-accent-400">
                    <Star size={16} className="text-amber-400" />
                    <span className="font-bold">{solana.userStats.impactScore.toLocaleString()}</span>
                </div>
                <div className="w-px h-6 bg-primary-200 dark:bg-darkPrimary-600"></div>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 text-primary-700 dark:text-darkPrimary-200 hover:bg-primary-200/50 dark:hover:bg-darkPrimary-700/50 rounded-full transition-colors"
                    aria-label={t('change_wallet')}
                >
                    <Wallet size={18} />
                    <span className="font-semibold text-sm font-mono">{truncateAddress(publicKey.toBase58())}</span>
                </button>
                 <button
                    onClick={() => disconnect()}
                    className="p-2 text-primary-600 dark:text-darkPrimary-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-primary-200/50 dark:hover:bg-darkPrimary-700/50 rounded-full transition-colors"
                    aria-label={t('disconnect_wallet')}
                >
                    <LogOut size={18} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setWalletModalOpen(true)}
            className="bg-accent-500 text-white font-bold py-2 px-6 rounded-full neo-button border-accent-900/50 dark:border-accent-200/50 dark:bg-accent-500 dark:text-white"
        >
            {t('connect_wallet')}
        </button>
    );
};


export const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-primary-50/80 dark:bg-darkPrimary-950/60 backdrop-blur-lg sticky top-0 z-40 border-b border-primary-200/80 dark:border-darkPrimary-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-primary-500 dark:text-darkPrimary-400 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 focus:outline-none"
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