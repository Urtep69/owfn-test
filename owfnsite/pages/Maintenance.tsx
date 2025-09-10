import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { Wrench, Twitter, Send } from 'lucide-react';
import { PROJECT_LINKS } from '../constants.ts';
import { LanguageSwitcher } from '../components/LanguageSwitcher.tsx';
import { DiscordIcon } from '../components/IconComponents.tsx';
import { ThemeSwitcher } from '../components/ThemeSwitcher.tsx';

const socialLinks = [
  { href: PROJECT_LINKS.x, icon: <Twitter className="w-6 h-6" />, name: 'X' },
  { href: PROJECT_LINKS.telegramGroup, icon: <Send className="w-6 h-6" />, name: 'Telegram' },
  { href: PROJECT_LINKS.discord, icon: <DiscordIcon className="w-6 h-6" />, name: 'Discord' },
];

export default function Maintenance() {
    const { t, setWalletModalOpen } = useAppContext();

    return (
        <div className="relative min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center text-center p-4 animate-fade-in-up">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher />
            </div>
            <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 sm:p-12 border border-slate-200 dark:border-slate-700 shadow-xl max-w-2xl w-full">
                <Wrench className="mx-auto w-20 h-20 text-primary-500 dark:text-primary-500 mb-6 animate-pulse" />
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-700 dark:text-slate-300 mb-4">{t('maintenance_heading')}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                    {t('maintenance_message')}
                </p>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                     <p className="text-md font-semibold text-slate-800 dark:text-slate-200">
                        {t('maintenance_stay_tuned')}
                    </p>
                    <div className="flex justify-center space-x-6 mt-4">
                        {socialLinks.map(link => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-transform transform hover:scale-110"
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
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                    {t('admin_login')}
                </button>
            </div>
        </div>
    );
}