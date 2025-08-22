

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
    <footer className="bg-surface-1 shadow-inner border-t border-border-color">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-text-secondary">
            {t('footer_copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex space-x-6">
            {socialLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent transition-colors"
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