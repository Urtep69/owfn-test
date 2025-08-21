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
    const { t, solana, setWalletModalOpen } = useAppContext();
    const { connected, publicKey } = useWallet();

    const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    if (connected && publicKey) {
        return (
             <div className="flex items-center space-x-2 bg-primary-200 dark:bg-darkPrimary-800 rounded-lg">
                <button
                    onClick={() => setWalletModalOpen(true)}
                    className="flex items-center space-x-2 pl-3 pr-2 py-2 text-primary-700 dark:text-darkPrimary-200 hover:bg-primary-300/50 dark:hover:bg-darkPrimary-700/50 rounded-l-lg transition-colors"
                    aria-label={t('change_wallet')}
                >
                    <Wallet size={18} />
                    <span className="font-semibold text-sm font-mono">{truncateAddress(publicKey.toBase58())}</span>
                </button>
                 <button
                    onClick={() => solana.signOut()}
                    className="p-2 text-primary-600 dark:text-darkPrimary-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-primary-300/50 dark:hover:bg-darkPrimary-700/50 rounded-r-lg transition-colors"
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
            className="bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2 px-4 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors"
        >
            {t('connect_wallet')}
        </button>
    );
};


export const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-primary-100/80 dark:bg-darkPrimary-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
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