

import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../types.ts';

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
    // Default to dark theme as per original design
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
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
