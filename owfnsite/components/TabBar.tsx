import React from 'react';
import { Link, useRoute } from 'wouter';
import { Home, ShoppingCart, Heart, User, Users as HubIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

const TabBarItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
    const [isActive] = useRoute(to);
    
    return (
        <Link to={to} className="flex-1 flex flex-col items-center justify-center text-center p-2 transition-colors duration-200">
            <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? 'bg-accent-100 dark:bg-darkAccent-900/50 -translate-y-1 scale-110 shadow-lg' : ''}`}>
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className: string }>, { 
                    className: `w-6 h-6 ${isActive ? 'text-accent-600 dark:text-darkAccent-400' : 'text-primary-500 dark:text-darkPrimary-400'}`
                }) : null}
            </div>
            <span className={`text-xs mt-1 font-semibold ${isActive ? 'text-accent-700 dark:text-darkAccent-400' : 'text-primary-600 dark:text-darkPrimary-500'}`}>
                {label}
            </span>
        </Link>
    );
};

export const TabBar = () => {
    const { t } = useAppContext();

    const navItems = [
        { to: '/', label: t('home'), icon: <Home /> },
        { to: '/presale', label: t('presale'), icon: <ShoppingCart /> },
        { to: '/impact', label: t('impact_portal'), icon: <Heart /> },
        { to: '/hub', label: t('impact_hub'), icon: <HubIcon /> },
        { to: '/profile', label: t('profile'), icon: <User /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-primary-50/80 dark:bg-darkPrimary-800/80 backdrop-blur-lg border-t border-primary-200/50 dark:border-darkPrimary-700/50 z-50">
            <div className="flex justify-around items-center h-full">
                {navItems.map(item => (
                    <TabBarItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
                ))}
            </div>
        </div>
    );
};