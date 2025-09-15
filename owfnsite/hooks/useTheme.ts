
import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../lib/types.js';

export const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedTheme = window.localStorage.getItem('owfn-theme') as Theme;
        if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
          return savedTheme;
        }
      }
    } catch (e) {
      console.warn("Could not read theme from localStorage", e);
    }
    // Default to dark theme as requested
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      // This is a failsafe for the new theme. If light mode is ever activated,
      // it will still look like dark mode because we removed the light theme colors.
      // The body class in index.html ensures dark mode is the base.
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    // Toggling is disabled for now to enforce the dark theme, but the hook remains for potential future use.
    // For now, let's keep it simple and allow toggling between a non-existent light theme and the dark theme.
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      window.localStorage.setItem('owfn-theme', newTheme);
    } catch (error) {
      console.warn("Could not save theme to localStorage", error);
    }
  }, [theme]);

  return [theme, toggleTheme];
};