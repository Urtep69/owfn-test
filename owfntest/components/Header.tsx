
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Shuffle, LogOut } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';

const WalletConnectButton = () => {
  const { t, solana } = useAppContext();
  const { connected, address, loading, connectWallet, disconnectWallet } = solana;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChangeWallet = () => {
    connectWallet(); // Simulate reconnecting or changing wallet
    setIsDropdownOpen(false);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsDropdownOpen(false);
  };

  if (connected) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(prev => !prev)}
          className="bg-accent-600 hover:bg-accent-700 text-primary-100 font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-300"
        >
          <span>{address && `${address.slice(0, 4)}...${address.slice(-4)}`}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-primary-800 rounded-md shadow-lg py-1 z-20 animate-fade-in-up" style={{ animationDuration: '200ms' }}>
            <button
              onClick={handleChangeWallet}
              className="w-full text-left px-4 py-2 text-sm text-primary-200 hover:bg-primary-700 flex items-center space-x-2"
            >
              <Shuffle className="w-4 h-4" />
              <span>{t('change_wallet')}</span>
            </button>
            <button
              onClick={handleDisconnect}
              className="w-full text-left px-4 py-2 text-sm text-primary-200 hover:bg-primary-700 flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('disconnect_wallet')}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => connectWallet()}
      disabled={loading}
      className="bg-accent-500 hover:bg-accent-600 text-primary-950 font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
    >
      {loading ? t('connecting') : t('connect_wallet')}
    </button>
  );
};

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

export const Header = ({ toggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
    <header className="bg-primary-900/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
             <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-primary-400 hover:bg-primary-700 focus:outline-none"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};
