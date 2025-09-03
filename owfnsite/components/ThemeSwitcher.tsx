
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

export const ThemeSwitcher = () => {
    const { t, theme, toggleTheme } = useAppContext();

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center p-2 rounded-lg hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"
            aria-label={t(theme === 'light' ? 'theme_switcher_aria_label_dark' : 'theme_switcher_aria_label_light')}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-primary-700" />
            ) : (
                <Sun className="w-5 h-5 text-darkPrimary-300" />
            )}
        </button>
    );
};