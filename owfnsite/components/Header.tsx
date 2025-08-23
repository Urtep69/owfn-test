import React from 'react';
import { Menu, X, LogOut, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const ConnectButton = () => {
    const { t, setWalletModalOpen } = useAppContext();
    const { connected, publicKey, disconnect } = useWallet();

    const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    if (connected && publicKey) {
        return (
             <div className="flex items-center space-x-2 bg-primary-100 dark:bg-darkPrimary-800 rounded-lg border-2 border-primary-900 dark:border-primary-200">
                <button
                    onClick={() => setWalletModalOpen(true)}
                    className="flex items-center space-x-2 pl-3 pr-2 py-2 text-primary-700 dark:text-primary-200 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 rounded-l-md transition-colors"
                    aria-label={t('change_wallet')}
                >
                    <Wallet size={18} />
                    <span className="font-semibold text-sm font-mono">{truncateAddress(publicKey.toBase58())}</span>
                </button>
                 <button
                    onClick={() => disconnect()}
                    className="p-2 text-primary-600 dark:text-primary-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 rounded-r-md transition-colors"
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
            className="bg-accent-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-primary-950 dark:border-primary-100 shadow-neo-brutal dark:shadow-dark-neo-brutal hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 active:shadow-none transition-transform"
        >
            {t('connect_wallet')}
        </button>
    );
};


export const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-primary-100/80 dark:bg-darkPrimary-900/80 backdrop-blur-md sticky top-0 z-40 border-b-2 border-primary-900 dark:border-primary-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 focus:outline-none"
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