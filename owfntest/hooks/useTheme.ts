

import { useEffect } from 'react';
import type { Theme } from '../types.ts';

export const useTheme = (): [Theme, () => void] => {
  const theme: Theme = 'dark';

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    // Theme is fixed, toggle does nothing.
  };

  return [theme, toggleTheme];
};
