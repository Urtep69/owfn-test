import React from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { ADMIN_WALLET_ADDRESS } from '../constants.ts';
import { ComingSoon } from './ComingSoon.tsx';

interface ComingSoonWrapperProps {
    children: React.ReactNode;
    showMessage?: boolean;
}

export const ComingSoonWrapper: React.FC<ComingSoonWrapperProps> = ({ children, showMessage = true }) => {
    const { solana } = useAppContext();
    const isAdmin = solana.connected && solana.address === ADMIN_WALLET_ADDRESS;
    
    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <div className="relative rounded-lg overflow-hidden">
            <div className="pointer-events-none blur-md" aria-hidden="true">
                {children}
            </div>
            {showMessage ? (
                <ComingSoon />
            ) : (
                <div className="absolute inset-0 bg-primary-100 dark:bg-darkPrimary-900 z-10"></div>
            )}
        </div>
    );
};