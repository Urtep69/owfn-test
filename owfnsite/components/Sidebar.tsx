import React from 'react';
import { Link, useRoute } from 'wouter';
import { 
    Home, Info, FileText, Map, Handshake, HelpCircle, Mail,
    ShoppingCart, PieChart, Gift, BarChart2, Briefcase, 
    Heart, TrendingUp, Lock, Award, User, Vote, Shield
} from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon } from './IconComponents.tsx';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const NavItem = ({ to, icon, label, isOpen, onClick }: { to: string, icon: React.ReactNode, label: string, isOpen: boolean, onClick: () => void }) => {
    const [isActive] = useRoute(to);
    const navLinkClasses = `relative flex items-center py-3 px-4 my-1 rounded-lg transition-colors duration-200 group ${
        isActive 
            ? 'bg-neon-cyan/10 text-neon-cyan font-semibold' 
            : 'text-text-secondary hover:bg-dark-card hover:text-text-primary'
        }`;

    return (
        <Link to={to} className={navLinkClasses} onClick={onClick}>
            {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-neon-cyan rounded-r-full"></div>}
            {icon}
            <span className={`ml-4 transition-all duration-200 ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'}`}>{label}</span>
        </Link>
    );
};

const NavGroup = ({ title, isOpen, children }: { title: string, isOpen: boolean, children: React.ReactNode }) => (
    <div>
        <h3 className={`px-4 pt-4 pb-2 text-xs font-semibold uppercase text-text-secondary transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            {title}
        </h3>
        {children}
    </div>
);

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
    const { t, solana } = useAppContext();
    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    };
    
    const navGroups = [
        {
            title: t('sidebar_explore'),
            links: [
                { to: '/', label: t('home'), icon: <Home size={20} /> },
                { to: '/about', label: t('about'), icon: <Info size={20} /> },
                { to: '/whitepaper', label: t('whitepaper'), icon: <FileText size={20} /> },
                { to: '/roadmap', label: t('roadmap'), icon: <Map size={20} /> },
            ]
        },
        {
            title: t('sidebar_finance'),
            links: [
                { to: '/presale', label: t('presale'), icon: <ShoppingCart size={20} /> },
                { to: '/tokenomics', label: t('tokenomics'), icon: <PieChart size={20} /> },
                { to: '/dashboard', label: t('dashboard'), icon: <BarChart2 size={20} /> },
            ]
        },
        {
            title: t('sidebar_engage'),
            links: [
                { to: '/donations', label: t('donations'), icon: <Gift size={20} /> },
                { to: '/staking', label: t('staking'), icon: <TrendingUp size={20} /> },
                { to: '/governance', label: t('governance'), icon: <Vote size={20} /> },
                { to: '/impact', label: t('impact_portal'), icon: <Heart size={20} /> },
            ]
        }
    ];

    return (
        <aside className={`fixed top-0 left-0 h-full bg-dark-bg/80 backdrop-blur-lg border-r border-dark-border shadow-lg z-50 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="flex items-center justify-center h-20 px-4 border-b border-dark-border flex-shrink-0">
                <Link to="/" onClick={handleLinkClick} className={`flex items-center space-x-3`}>
                    <OwfnIcon className="h-9 w-9" />
                    <span className={`font-bold text-xl text-text-primary whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}`}>OWFN</span>
                </Link>
             </div>

            <nav className="flex-1 overflow-y-auto px-2 py-4">
                {navGroups.map(group => (
                    <NavGroup key={group.title} title={group.title} isOpen={isOpen}>
                        {group.links.map(link => (
                            <NavItem key={link.to} to={link.to} icon={link.icon} label={link.label} isOpen={isOpen} onClick={handleLinkClick} />
                        ))}
                    </NavGroup>
                ))}
                 {isAdmin && (
                    <NavGroup title="Admin" isOpen={isOpen}>
                        <NavItem 
                            to="/admin/presale" 
                            icon={<Shield size={20} />} 
                            label={t('presale_admin_title')} 
                            isOpen={isOpen} 
                            onClick={handleLinkClick} 
                        />
                    </NavGroup>
                )}
            </nav>
            
            <div className="px-2 py-4 border-t border-dark-border flex-shrink-0">
                 <NavItem to="/profile" icon={<User size={20} />} label={t('profile')} isOpen={isOpen} onClick={handleLinkClick} />
            </div>
        </aside>
    );
};