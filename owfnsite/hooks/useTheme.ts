import { useState, useEffect } from 'react';
import type { Theme } from '../types.ts';

// This hook is now simplified to enforce a permanent dark theme as per user request.
// The toggle functionality is removed.
export const useTheme = (): [Theme, () => void] => {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    const root = document.documentElement;
    // Always ensure the dark class is present and light class is absent.
    if (!root.classList.contains('dark')) {
      root.classList.add('dark');
    }
    if (root.classList.contains('light')) {
        root.classList.remove('light');
    }
  }, []); // Empty dependency array means this runs only once on mount.
  
  // The toggle function is now a no-op but is kept for API compatibility.
  const toggleTheme = () => {
    console.log("Theme switching is disabled.");
  };

  return [theme, toggleTheme];
};