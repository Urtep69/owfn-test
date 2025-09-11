import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Loader2, Copy, Check, ExternalLink, ChevronRight, X, Menu, Repeat, LogIn } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';
import { WalletManagerIcon } from './IconComponents.tsx';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const ConnectButton = () => {
    const { t, solana, siws } = useAppContext();
    const { setVisible } = useWalletModal();
    const { connected, address, connecting, disconnectWallet } = solana;
    const { isAuthenticated, signIn, signOut, isLoading: isSiwsLoading, isSessionLoading } = siws;
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const copyToClipboard = () => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleSignOut = async () => {
        await signOut();
        setDropdownOpen(false);
    }
    
    const handleDisconnect = async () => {
        await signOut();
        await disconnectWallet();
        setDropdownOpen(false);
    }

    if (connecting || isSessionLoading) {
        return (
            <div className="flex items-center space-x-3 px-4 py-2 bg-primary-200 dark:bg-darkPrimary-800 rounded-lg">
                <Loader2 size={18} className="animate-spin text-primary-600 dark:text-darkPrimary-400" />
                <span className="font-semibold text-sm text-primary-700 dark:text-darkPrimary-200">
                    {t('connecting')}
                </span>
            </div>
        );
    }

    if (!connected) {
        return (
            <button
                onClick={() => setVisible(true)}
                className="group relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden font-bold text-accent-950 dark:text-darkPrimary-950 rounded-lg shadow-3d hover:shadow-3d-lg transition-all duration-300 transform hover:-translate-y-0.5 btn-tactile"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-accent-400 to-accent-500 dark:from-darkAccent-400 dark:to-darkAccent-600"></span>
                <span className="absolute bottom-0 right-0 w-full h-full transition-all duration-500 ease-in-out transform translate-x-full translate-y-full bg-accent-500/80 dark:bg-darkAccent-500/80 group-hover:translate-x-0 group-hover:translate-y-0"></span>
                <span className="relative font-sans">{t('connect_wallet')}</span>
            </button>
        );
    }

    if (!isAuthenticated) {
        return (
            <button
                onClick={signIn}
                disabled={isSiwsLoading}
                className="group relative inline-flex items-center justify-center px-5 py-2.5 overflow-hidden font-bold text-accent-950 dark:text-darkPrimary-950 rounded-lg shadow-3d hover:shadow-3d-lg transition-all duration-300 transform hover:-translate-y-0.5 btn-tactile"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-accent-400 to-accent-500 dark:from-darkAccent-400 dark:to-darkAccent-600"></span>
                 <span className="absolute bottom-0 right-0 w-full h-full transition-all duration-500 ease-in-out transform translate-x-full translate-y-full bg-accent-500/80 dark:bg-darkAccent-500/80 group-hover:translate-x-0 group-hover:translate-y-0"></span>
                <span className="relative font-sans flex items-center gap-2">
                    {isSiwsLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20}/>}
                    {isSiwsLoading ? t('authenticating') : t('sign_in')}
                </span>
            </button>
        );
    }
    
    return (
         <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center bg-primary-100 dark:bg-darkPrimary-800 border-2 border-green-500/50 dark:border-green-400/50 rounded-full text-sm font-semibold text-primary-900 dark:text-darkPrimary-100 transition-all duration-300 hover:border-accent-400 dark:hover:border-darkAccent-600 shadow-3d hover:shadow-3d-lg"
            >
                <div className="flex items-center space-x-2 pl-4 pr-3 py-1.5">
                    <WalletManagerIcon className="w-5 h-5" />
                    <span className="text-green-600 dark:text-green-400 text-xs tracking-wider">{truncateAddress(address!)}</span>
                    <ChevronRight size={16} className={`text-primary-500 dark:text-darkAccent-400/70 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
                </div>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-primary-50/80 dark:bg-darkPrimary-800/80 backdrop-blur-xl border border-primary-200/50 dark:border-darkPrimary-700/50 rounded-lg shadow-3d-lg animate-fade-in-up" style={{animationDuration: '200ms'}}>
                    <div className="p-3">
                         <span className="font-semibold text-sm font-mono text-primary-800 dark:text-darkPrimary-100">{truncateAddress(address!)}</span>
                    </div>
                    <div className="p-2 space-y-1 border-t border-primary-200 dark:border-darkPrimary-700">
                         <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-primary-800 dark:text-darkPrimary-200 hover:bg-primary-100 dark:hover:bg-darkPrimary-700 transition-colors"
                        >
                            <span>{t('copy_address')}</span>
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        <a
                            href={`https://solscan.io/account/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-primary-800 dark:text-darkPrimary-200 hover:bg-primary-100 dark:hover:bg-darkPrimary-700 transition-colors"
                        >
                            <span>{t('view_on_solscan')}</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                    <div className="p-2 border-t border-primary-200 dark:border-darkPrimary-700">
                         <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 font-semibold transition-colors"
                        >
                            <span>{t('sign_out')}</span>
                            <LogOut size={16} />
                        </button>
                         <button
                            onClick={handleDisconnect}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-primary-800 dark:text-darkPrimary-200 hover:bg-primary-100 dark:hover:bg-darkPrimary-700 transition-colors"
                        >
                            <span>{t('disconnect_wallet')}</span>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-primary-100/70 dark:bg-darkPrimary-950/70 backdrop-blur-lg sticky top-0 z-40 border-b border-primary-200/80 dark:border-darkPrimary-800/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-primary-500 dark:text-darkPrimary-400 hover:bg-primary-200 dark:hover:bg-darkPrimary-700 focus:outline-none hidden md:block"
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