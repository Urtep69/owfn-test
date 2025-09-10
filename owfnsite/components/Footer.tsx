

import React from 'react';
import { Twitter, Send } from 'lucide-react';
import { PROJECT_LINKS } from '../constants.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { DiscordIcon } from './IconComponents.tsx';

const socialLinks = [
  { href: PROJECT_LINKS.x, icon: <Twitter className="w-6 h-6" />, name: 'X' },
  { href: PROJECT_LINKS.telegramGroup, icon: <Send className="w-6 h-6" />, name: 'Telegram' },
  { href: PROJECT_LINKS.discord, icon: <DiscordIcon className="w-6 h-6" />, name: 'Discord' },
];

export const Footer = () => {
  const { t } = useAppContext();
  return (
    <footer className="bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('footer_copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex space-x-6">
            {socialLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                <span className="sr-only">{link.name}</span>
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};