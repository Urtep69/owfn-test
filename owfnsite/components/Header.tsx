
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Loader2, Copy, Check, ExternalLink, ChevronRight, X, Menu, Repeat } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LanguageSwitcher } from './LanguageSwitcher.js';
import { ThemeSwitcher } from './ThemeSwitcher.js';
import { useAppContext } from '../contexts/AppContext.js';
import { WalletManagerIcon } from './IconComponents.js';

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
            <div className="flex items-center space-x-3 px-4 py-2 bg-dextools-card border border-dextools-border rounded-lg">
                <Loader2 size={18} className="animate-spin text-dextools-accent-blue" />
                <span className="font-semibold text-sm text-dextools-text-secondary">
                    {t('connecting')}
                </span>
            </div>
        );
    }

    if (!connected || !address) {
        return (
            <button
                onClick={() => setVisible(true)}
                className="group relative inline-flex items-center justify-center px-5 py-2 overflow-hidden font-bold text-white rounded-lg shadow-md transition-transform transform hover:scale-105 bg-dextools-special hover:shadow-lg hover:shadow-dextools-special/50"
            >
                {t('connect_wallet')}
            </button>
        );
    }
    
    return (
         <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center bg-dextools-card border border-dextools-border rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:border-dextools-accent-blue/70 shadow-lg px-4 py-2"
            >
                <WalletManagerIcon className="w-5 h-5 mr-2 text-dextools-accent-blue" />
                <span className="text-dextools-text-primary tracking-wider">{truncateAddress(address)}</span>
                <ChevronRight size={16} className={`ml-2 text-dextools-text-secondary transition-transform ${isDropdownOpen ? 'rotate-90' : ''}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-dextools-card/80 backdrop-blur-xl border border-dextools-border rounded-lg shadow-lg animate-fade-in" style={{animationDuration: '200ms'}}>
                    <div className="p-3">
                         <span className="font-semibold text-sm font-mono text-dextools-text-primary">{truncateAddress(address)}</span>
                    </div>
                    <div className="p-2 space-y-1 border-t border-dextools-border">
                         <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-dextools-text-primary hover:bg-dextools-background transition-colors"
                        >
                            <span>{t('copy_address', {defaultValue: 'Copy Address'})}</span>
                            {copied ? <Check size={16} className="text-dextools-accent-green" /> : <Copy size={16} />}
                        </button>
                        <button
                            onClick={() => setVisible(true)}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-dextools-text-primary hover:bg-dextools-background transition-colors"
                        >
                            <span>{t('change_wallet', {defaultValue: 'Change Wallet'})}</span>
                            <Repeat size={16} />
                        </button>
                        <a
                            href={`https://solscan.io/account/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-dextools-text-primary hover:bg-dextools-background transition-colors"
                        >
                            <span>{t('view_on_solscan', {defaultValue: 'View on Solscan'})}</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                    <div className="p-2 border-t border-dextools-border">
                         <button
                            onClick={disconnectWallet}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-dextools-accent-red hover:bg-dextools-accent-red/10 font-semibold transition-colors"
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
    <header className="bg-dextools-card/80 backdrop-blur-sm sticky top-0 z-40 border-b border-dextools-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-dextools-text-secondary hover:bg-dextools-border focus:outline-none"
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