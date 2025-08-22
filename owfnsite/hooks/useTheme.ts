

import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../types.ts';

export const useTheme = (): [Theme, () => void] => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Force dark theme as the new default
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
    // This functionality is preserved but the default is now dark.
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