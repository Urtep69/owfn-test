import React from 'react';
import { useAppContext } from '../contexts/AppContext.js';
import { Wrench, Twitter, Send } from 'lucide-react';
import { PROJECT_LINKS } from '../lib/constants.js';
import { LanguageSwitcher } from '../components/LanguageSwitcher.js';
import { DiscordIcon } from '../components/IconComponents.js';
import { ThemeSwitcher } from '../components/ThemeSwitcher.js';

const socialLinks = [
  { href: PROJECT_LINKS.x, icon: <Twitter className="w-6 h-6" />, name: 'X' },
  { href: PROJECT_LINKS.telegramGroup, icon: <Send className="w-6 h-6" />, name: 'Telegram' },
  { href: PROJECT_LINKS.discord, icon: <DiscordIcon className="w-6 h-6" />, name: 'Discord' },
];

export default function Maintenance() {
    const { t, setWalletModalOpen } = useAppContext();

    return (
        <div className="relative min-h-screen bg-dextools-background flex flex-col justify-center items-center text-center p-4 animate-fade-in">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
            </div>
            <div className="bg-dextools-card border border-dextools-border p-8 sm:p-12 rounded-lg shadow-2xl max-w-2xl w-full">
                <Wrench className="mx-auto w-20 h-20 text-dextools-accent-blue mb-6 animate-pulse" />
                <h1 className="text-4xl sm:text-5xl font-extrabold text-dextools-text-primary mb-4">{t('maintenance_heading')}</h1>
                <p className="text-lg text-dextools-text-secondary leading-relaxed mb-8">
                    {t('maintenance_message')}
                </p>
                <div className="bg-dextools-background p-4 rounded-lg">
                     <p className="text-md font-semibold text-dextools-text-primary">
                        {t('maintenance_stay_tuned')}
                    </p>
                    <div className="flex justify-center space-x-6 mt-4">
                        {socialLinks.map(link => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-dextools-text-secondary hover:text-dextools-accent-blue transition-transform transform hover:scale-110"
                                aria-label={link.name}
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
             <div className="absolute bottom-4">
                <button
                    onClick={() => setWalletModalOpen(true)}
                    className="text-sm text-dextools-text-secondary hover:text-dextools-accent-blue transition-colors"
                >
                    {t('admin_login')}
                </button>
            </div>
        </div>
    );
}