import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

export const LanguageSwitcher = () => {
    const { currentLanguage, supportedLanguages, setLang } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectLanguage = (langCode: string) => {
        setLang(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="flex items-center space-x-2 p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-label="Change language"
            >
                <span className="text-xl">{currentLanguage.flag}</span>
                <span className="font-semibold hidden sm:inline">{currentLanguage.code.toUpperCase()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 w-48 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-20 animate-fade-in-up" 
                    style={{ animationDuration: '200ms' }}
                    role="menu"
                >
                    {supportedLanguages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelectLanguage(lang.code)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 flex items-center space-x-3 transition-colors"
                            role="menuitem"
                        >
                            <span className="text-xl" aria-hidden="true">{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};