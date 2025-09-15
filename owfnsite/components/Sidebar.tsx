import React, { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { 
    Home, Info, FileText, Map as MapIcon, Handshake, HelpCircle, Mail,
    ShoppingCart, PieChart, Gift, BarChart2, Briefcase, 
    Heart, TrendingUp, Lock, Award, User, Vote, Shield, ChevronRight
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';
import { OwfnIcon } from './IconComponents.js';
import { ADMIN_WALLET_ADDRESS } from '../lib/constants.js';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const NavItem = ({ to, icon, label, isOpen, onClick }: { to: string, icon: React.ReactNode, label: string, isOpen: boolean, onClick: () => void }) => {
    const [isActive] = useRoute(to);
    const navLinkClasses = `flex items-center h-10 px-4 my-1 rounded-md transition-colors duration-200 group relative ${
        isActive 
            ? 'bg-dextools-special/20 text-dextools-accent-blue font-semibold' 
            : 'text-dextools-text-secondary hover:bg-dextools-border hover:text-dextools-text-primary'
        }`;

    return (
        <Link to={to} className={navLinkClasses} onClick={onClick}>
            {icon}
            <span className={`ml-4 whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
             {!isOpen && (
                <div className="absolute left-full rounded-md px-2 py-1 ml-4 bg-dextools-card border border-dextools-border text-dextools-text-primary text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50">
                    {label}
                </div>
            )}
        </Link>
    );
};

const NavGroup = ({ title, isOpen, children }: { title: string, isOpen: boolean, children: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!isOpen) {
        return <>{children}</>;
    }
    
    return (
        <div>
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full px-4 mt-4 mb-1 text-xs font-bold uppercase text-dextools-text-secondary hover:text-dextools-text-primary"
            >
                <span>{title}</span>
                <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
            {isExpanded && <div className="pl-2">{children}</div>}
        </div>
    );
};


export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const { t, solana } = useAppContext();
    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };
    
    const exploreLinks = [
        { to: '/', label: t('dashboard'), icon: <Home size={20} /> },
        { to: '/about', label: t('about'), icon: <Info size={20} /> },
        { to: '/roadmap', label: t('roadmap'), icon: <MapIcon size={20} /> },
        { to: '/whitepaper', label: t('whitepaper'), icon: <FileText size={20} /> },
    ];
    
    const financeLinks = [
        { to: '/presale', label: t('presale'), icon: <ShoppingCart size={20} /> },
        { to: '/tokenomics', label: t('tokenomics'), icon: <PieChart size={20} /> },
        { to: '/staking', label: t('staking'), icon: <TrendingUp size={20} /> },
        { to: '/vesting', label: t('vesting'), icon: <Lock size={20} /> },
    ];

    const engageLinks = [
        { to: '/donations', label: t('donations'), icon: <Gift size={20} /> },
        { to: '/impact', label: t('impact_portal'), icon: <Heart size={20} /> },
        { to: '/governance', label: t('governance'), icon: <Vote size={20} /> },
        { to: '/airdrop', label: t('airdrop'), icon: <Award size={20} /> },
        { to: '/profile', label: t('profile'), icon: <User size={20} /> },
    ];
    
    const infoLinks = [
        { to: '/partnerships', label: t('partnerships'), icon: <Handshake size={20} /> },
        { to: '/faq', label: t('faq'), icon: <HelpCircle size={20} /> },
        { to: '/contact', label: t('contact'), icon: <Mail size={20} /> },
    ];
    
    const adminLinks = [
        { to: '/admin/presale', label: t('presale_admin_title'), icon: <Shield size={20} /> }
    ];

    return (
        <aside className={`fixed top-0 left-0 h-full bg-dextools-card border-r border-dextools-border z-50 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-16'} md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="flex items-center justify-center h-16 border-b border-dextools-border flex-shrink-0">
                <Link to="/" onClick={handleLinkClick} className="flex items-center space-x-3">
                    <OwfnIcon className="h-9 w-9" />
                    <span className={`font-bold text-xl text-dextools-text-primary whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>OWFN</span>
                </Link>
             </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
                <NavGroup title={t('sidebar_explore')} isOpen={isOpen}>
                    {exploreLinks.map(link => <NavItem key={link.to} {...link} isOpen={isOpen} onClick={handleLinkClick} />)}
                </NavGroup>
                <NavGroup title={t('sidebar_finance')} isOpen={isOpen}>
                    {financeLinks.map(link => <NavItem key={link.to} {...link} isOpen={isOpen} onClick={handleLinkClick} />)}
                </NavGroup>
                 <NavGroup title={t('sidebar_engage')} isOpen={isOpen}>
                    {engageLinks.map(link => <NavItem key={link.to} {...link} isOpen={isOpen} onClick={handleLinkClick} />)}
                </NavGroup>
            </nav>
            
            <div className="px-2 py-4 border-t border-dextools-border flex-shrink-0">
                 {infoLinks.map(link => <NavItem key={link.to} {...link} isOpen={isOpen} onClick={handleLinkClick} />)}
                {isAdmin && adminLinks.map(link => <NavItem key={link.to} {...link} isOpen={isOpen} onClick={handleLinkClick} />)}
            </div>
        </aside>
    );
};