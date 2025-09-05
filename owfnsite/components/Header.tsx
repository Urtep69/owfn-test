import React, { useState, useEffect, useRef } from 'react';
import { Link, useRoute } from 'wouter';
import { LogOut, Loader2, Copy, Check, ExternalLink, X, Menu, Repeat } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon } from './IconComponents.tsx';

const navLinks = [
    { to: '/', labelKey: 'home' },
    { to: '/presale', labelKey: 'presale' },
    { to: '/dashboard', labelKey: 'dashboard' },
    { to: '/donations', labelKey: 'donations' },
    { to: '/about', labelKey: 'about' },
    { to: '/impact', labelKey: 'impact_portal' },
];

const NavLink = ({ to, label, onClick }: { to: string, label: string, onClick: () => void }) => {
    const [isActive] = useRoute(to);
    return (
        <Link to={to} onClick={onClick}>
            <a className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${isActive ? 'text-text-primary bg-surface' : 'text-text-secondary hover:text-text-primary'}`}>
                {label}
            </a>
        </Link>
    );
};


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
            <button className="flex items-center space-x-2 px-4 py-2 bg-surface rounded-lg border border-border" disabled>
                <Loader2 size={18} className="animate-spin text-text-secondary" />
                <span className="font-semibold text-sm text-text-secondary">
                    {t('connecting')}
                </span>
            </button>
        );
    }

    if (!connected || !address) {
        return (
            <button
                onClick={() => setVisible(true)}
                className="bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                {t('connect_wallet')}
            </button>
        );
    }
    
    return (
         <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center bg-surface border border-border rounded-lg text-sm font-semibold text-text-primary transition-colors hover:border-primary px-4 py-2"
            >
                <span>{truncateAddress(address)}</span>
            </button>

            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg animate-fade-in-up" style={{animationDuration: '200ms'}}>
                    <div className="p-2 space-y-1">
                         <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-text-primary hover:bg-background transition-colors"
                        >
                            <span>{t('copy_address')}</span>
                            {copied ? <Check size={16} className="text-secondary" /> : <Copy size={16} />}
                        </button>
                        <button
                            onClick={() => setVisible(true)}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-text-primary hover:bg-background transition-colors"
                        >
                            <span>{t('change_wallet')}</span>
                            <Repeat size={16} />
                        </button>
                        <a
                            href={`https://solscan.io/account/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-text-primary hover:bg-background transition-colors"
                        >
                            <span>{t('view_on_solscan')}</span>
                            <ExternalLink size={16} />
                        </a>
                    </div>
                    <div className="p-2 border-t border-border">
                         <button
                            onClick={disconnectWallet}
                            className="w-full flex items-center justify-between text-left px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 font-semibold transition-colors"
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


export const Header = () => {
    const { t } = useAppContext();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-40 border-b border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2">
                            <OwfnIcon className="w-8 h-8"/>
                            <span className="font-bold text-lg text-text-primary">OWFN</span>
                        </Link>
                    </div>

                    {/* Center: Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-2">
                        {navLinks.map(link => <NavLink key={link.to} to={link.to} label={t(link.labelKey)} onClick={closeMobileMenu} />)}
                    </nav>

                    {/* Right side: Actions */}
                    <div className="flex items-center space-x-2">
                        <LanguageSwitcher />
                        <ConnectButton />
                        <div className="md:hidden">
                            <button onClick={() => setMobileMenuOpen(prev => !prev)} className="p-2 rounded-md hover:bg-border text-text-secondary">
                                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                 <div className="md:hidden bg-surface border-t border-border animate-fade-in-up" style={{animationDuration: '200ms'}}>
                    <nav className="flex flex-col space-y-2 p-4">
                        {navLinks.map(link => <NavLink key={link.to} to={link.to} label={t(link.labelKey)} onClick={closeMobileMenu} />)}
                    </nav>
                </div>
            )}
        </header>
    );
};