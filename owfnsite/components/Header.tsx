import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Loader2, Copy, Check, ExternalLink, ChevronRight, X, Menu, Repeat } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';
import { WalletManagerIcon } from './IconComponents.tsx';
import { OwfnIcon } from './IconComponents.tsx';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const ConnectButton = () => {
    const { t, solana } = useAppContext();
    const { setVisible } = useWalletModal();
    const { connected, address, connecting, disconnectWallet } = solana;
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

    if (connecting) {
        return (
            <div className="flex items-center space-x-3 px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                <Loader2 size={18} className="animate-spin text-slate-600 dark:text-slate-400" />
                <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                    {t('connecting')}
                </span>
            </div>
        );
    }

    if (!connected || !address) {
        return (
            <button
                onClick={() => setVisible(true)}
                className="bg-primary-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-md hover:shadow-glow-primary"
            >
                {t('connect_wallet')}
            </button>
        );
    }
    
    return (
         <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center space-x-2 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-full py-1.5 pl-2 pr-4 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
            >
                <OwfnIcon className="w-6 h-6" />
                <span>{truncateAddress(address)}</span>
                <ChevronRight size={16} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl animate-fade-in-up" style={{animationDuration: '200ms'}}>
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                         <span className="font-semibold text-sm font-mono text-slate-800 dark:text-slate-100">{truncateAddress(address)}</span>
                    </div>
                    <div className="p-2 space-y-1">
                         <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                        >
                            <span>{t('copy_address', {defaultValue: 'Copy Address'})}</span>
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        <button
                            onClick={() => setVisible(true)}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                        >
                            <span>{t('change_wallet', {defaultValue: 'Change Wallet'})}</span>
                            <Repeat size={16} />
                        </button>
                        <a
                            href={`https://solscan.io/account/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                        >
                            <span>{t('view_on_solscan', {defaultValue: 'View on Solscan'})}</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                    <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                         <button
                            onClick={disconnectWallet}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 font-semibold transition-colors"
                        >
                            <span>{t('disconnect_wallet')}</span>
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 focus:outline-none"
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