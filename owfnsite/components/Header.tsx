import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Loader2, Copy, Check, ExternalLink, ChevronRight, X, Menu, Repeat } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';
import { WalletManagerIcon } from './IconComponents.tsx';

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
            <div className="flex items-center space-x-3 px-4 py-2 bg-surface rounded-lg">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span className="font-semibold text-sm text-foreground">
                    {t('connecting')}
                </span>
            </div>
        );
    }

    if (!connected || !address) {
        return (
            <button
                onClick={() => setVisible(true)}
                className="group relative inline-flex items-center justify-center px-5 py-2 overflow-hidden font-bold text-primary-foreground rounded-lg shadow-md transition-transform transform hover:scale-105 bg-primary hover:bg-primary/90"
            >
                {t('connect_wallet')}
            </button>
        );
    }
    
    return (
         <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center bg-surface border border-border rounded-full text-sm font-semibold text-white transition-all duration-300 hover:border-primary/70 shadow-lg"
            >
                <div className="flex items-center space-x-2 pl-4 pr-4">
                    <WalletManagerIcon className="w-5 h-5 text-primary" />
                    <span className="text-foreground-muted text-xs tracking-wider font-mono">{truncateAddress(address)}</span>
                    <ChevronRight size={16} className="text-foreground-muted/70" />
                </div>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface/80 backdrop-blur-xl border border-border rounded-lg shadow-lg animate-fade-in-up" style={{animationDuration: '200ms'}}>
                    <div className="p-3">
                         <span className="font-semibold text-sm font-mono text-foreground">{truncateAddress(address)}</span>
                    </div>
                    <div className="p-2 space-y-1 border-t border-border">
                         <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-foreground hover:bg-border transition-colors"
                        >
                            <span>{t('copy_address', {defaultValue: 'Copy Address'})}</span>
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        <button
                            onClick={() => setVisible(true)}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-foreground hover:bg-border transition-colors"
                        >
                            <span>{t('change_wallet', {defaultValue: 'Change Wallet'})}</span>
                            <Repeat size={16} />
                        </button>
                        <a
                            href={`https://solscan.io/account/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-foreground hover:bg-border transition-colors"
                        >
                            <span>{t('view_on_solscan', {defaultValue: 'View on Solscan'})}</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                    <div className="p-2 border-t border-border">
                         <button
                            onClick={disconnectWallet}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-red-500 hover:bg-red-500/10 font-semibold transition-colors"
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
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-foreground-muted hover:bg-surface focus:outline-none"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};