
import { useEffect } from 'react';
import type { Theme } from '../types.ts';

// This hook is now simplified to enforce a dark theme permanently as per the new design direction.
export const useTheme = (): [Theme, () => void] => {
  const theme: Theme = 'dark';

  useEffect(() => {
    const root = document.documentElement;
    // Remove light class if it exists and always add dark class.
    root.classList.remove('light');
    root.classList.add('dark');
  }, []);
  
  const toggleTheme = () => {
    // The ability to toggle themes is removed to enforce the new design.
    console.log("Theme toggling is disabled in the current design.");
  };

  return [theme, toggleTheme];
};