import React from 'react';
import { Menu, X, LogOut, Wallet, Star } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon } from './IconComponents.tsx';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const ConnectButton = () => {
    const { t, setWalletModalOpen, solana, isVerified } = useAppContext();
    const { connected, publicKey, disconnect } = useWallet();

    const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    if (connected && publicKey && isVerified) {
        return (
             <div className="flex items-center space-x-2 bg-dark-card/50 rounded-full border border-dark-border p-1">
                <div className="flex items-center space-x-2 pl-3 text-sm text-neon-cyan">
                    <Star size={16} className="text-amber-400" />
                    <span className="font-bold">{solana.userStats.impactScore.toLocaleString()}</span>
                </div>
                <div className="w-px h-6 bg-dark-border"></div>
                <button
                    onClick={() => setWalletModalOpen(true)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 text-text-primary hover:bg-dark-card rounded-full transition-colors"
                    aria-label={t('change_wallet')}
                >
                    <Wallet size={18} />
                    <span className="font-semibold text-sm font-mono">{truncateAddress(publicKey.toBase58())}</span>
                </button>
                 <button
                    onClick={() => disconnect()}
                    className="p-2 text-text-secondary hover:text-red-400 hover:bg-dark-card rounded-full transition-colors"
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
            className="font-bold py-2 px-6 rounded-full text-lg neon-button"
        >
            {t('connect_wallet')}
        </button>
    );
};


export const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-dark-bg/80 backdrop-blur-lg sticky top-0 z-40 border-b border-dark-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-text-secondary hover:bg-dark-card focus:outline-none"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className={`items-center ml-4 hidden md:flex transition-opacity duration-300 ${isSidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
               <OwfnIcon className="h-9 w-9" />
               <span className="font-bold text-xl text-text-primary ml-3">OWFN</span>
            </div>
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