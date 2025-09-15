

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.js';

export const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useAppContext();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center p-2 rounded-lg text-secondary dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-dark-surface/50 transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5" />
            ) : (
                <Sun className="w-5 h-5" />
            )}
        </button>
    );
};