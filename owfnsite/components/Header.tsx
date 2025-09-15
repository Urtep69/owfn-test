
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Loader2, Copy, Check, ExternalLink, ChevronDown, X, Menu, Repeat, Wallet } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LanguageSwitcher } from './LanguageSwitcher.js';
import { ThemeSwitcher } from './ThemeSwitcher.js';
import { useAppContext } from '../contexts/AppContext.js';

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
            <div className="flex items-center space-x-3 px-4 py-2 bg-surface/50 dark:bg-dark-surface rounded-lg border border-transparent dark:border-dark-border">
                <Loader2 size={18} className="animate-spin text-accent dark:text-dark-accent" />
                <span className="font-semibold text-sm text-primary dark:text-dark-primary">
                    {t('connecting')}
                </span>
            </div>
        );
    }

    if (!connected || !address) {
        return (
            <button
                onClick={() => setVisible(true)}
                className="group relative inline-flex items-center justify-center px-5 py-2 overflow-hidden font-bold text-white rounded-lg shadow-md transition-transform transform hover:scale-105 bg-accent hover:bg-accent-hover"
            >
                <span className="relative">{t('connect_wallet')}</span>
            </button>
        );
    }
    
    return (
         <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center space-x-2 bg-surface/50 dark:bg-dark-surface border border-transparent dark:border-dark-border rounded-full py-2 px-4 text-sm font-semibold text-primary dark:text-dark-primary hover:border-accent dark:hover:border-dark-accent transition-colors"
            >
                <Wallet size={16} className="text-accent dark:text-dark-accent" />
                <span>{truncateAddress(address)}</span>
                <ChevronDown size={16} className={`text-secondary dark:text-dark-secondary transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface/80 dark:bg-dark-surface/90 backdrop-blur-xl border border-gray-200/50 dark:border-dark-border rounded-lg shadow-glass animate-fade-in-up" style={{animationDuration: '200ms'}}>
                    <div className="p-3">
                         <span className="font-semibold text-sm font-mono text-primary dark:text-dark-primary">{truncateAddress(address)}</span>
                    </div>
                    <div className="p-2 space-y-1 border-t border-gray-200 dark:border-dark-border">
                         <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-primary dark:text-dark-primary hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors"
                        >
                            <span>{t('copy_address', {defaultValue: 'Copy Address'})}</span>
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        <button
                            onClick={() => setVisible(true)}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-primary dark:text-dark-primary hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors"
                        >
                            <span>{t('change_wallet', {defaultValue: 'Change Wallet'})}</span>
                            <Repeat size={16} />
                        </button>
                        <a
                            href={`https://solscan.io/account/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-primary dark:text-dark-primary hover:bg-gray-100 dark:hover:bg-dark-surface/50 transition-colors"
                        >
                            <span>{t('view_on_solscan', {defaultValue: 'View on Solscan'})}</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                    <div className="p-2 border-t border-gray-200 dark:border-dark-border">
                         <button
                            onClick={disconnectWallet}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-red-600 dark:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-400/10 font-semibold transition-colors"
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
    <header className="bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200/20 dark:border-dark-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-secondary dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-dark-surface/50 focus:outline-none"
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