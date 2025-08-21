import React from 'react';
import type { Token } from '../types.ts';
import { GenericTokenIcon } from './IconComponents.tsx';

interface TokenIconProps {
  token: Partial<Token>;
  className?: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({ token, className = 'w-8 h-8' }) => {
  const logo = token.logo;

  if (typeof logo === 'string') {
    return <GenericTokenIcon uri={logo} className={className} />;
  }
  
  if (typeof logo === 'function') {
    const LogoComponent = logo;
    return <LogoComponent className={className} />;
  }

  return <GenericTokenIcon className={className} />;
};
