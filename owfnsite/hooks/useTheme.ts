import { useState, useEffect, useCallback } from 'react';
import type { Theme } from '../types.ts';

export const useTheme = (): [Theme, () => void] => {
  const [theme] = useState<Theme>('dark');

  useEffect(() => {
    const root = document.documentElement;
    // Always ensure the dark class is present
    if (!root.classList.contains('dark')) {
      root.classList.add('dark');
    }
  }, []);

  // The toggle function is now a no-op as the theme is fixed to dark.
  const toggleTheme = useCallback(() => {}, []);

  return [theme, toggleTheme];
};