import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { SiwsSession, SiwsReturn } from '../types.ts';

const SESSION_KEY = 'owfn-siws-session';

export const useSiws = (): SiwsReturn => {
    const { publicKey, signMessage, connected } = useWallet();
    const [session, setSession] = useState<SiwsSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    const signOut = useCallback(async (): Promise<void> => {
        window.localStorage.removeItem(SESSION_KEY);
        setSession(null);
    }, []);

    useEffect(() => {
        try {
            const storedSession = window.localStorage.getItem(SESSION_KEY);
            if (storedSession) {
                const parsedSession: SiwsSession = JSON.parse(storedSession);
                
                // If a wallet is connected, verify the session belongs to it.
                if (publicKey && parsedSession.publicKey !== publicKey.toBase58()) {
                    signOut(); // Wallet changed, clear session
                } else {
                    setSession(parsedSession);
                }
            }
        } catch (error) {
            console.warn("Could not load SIWS session from localStorage", error);
        } finally {
            setIsSessionLoading(false);
        }
    }, [publicKey, signOut]);

    // Automatically sign out if wallet disconnects
    useEffect(() => {
        if (!connected && session) {
            signOut();
        }
    }, [connected, session, signOut]);


    const signIn = useCallback(async (): Promise<boolean> => {
        if (!publicKey || !signMessage) {
            console.error("Wallet not connected or signMessage not available");
            return false;
        }
        setIsLoading(true);
        try {
            const now = new Date();
            const message = `owfn.org wants you to sign in with your Solana account:
${publicKey.toBase58()}

Issued At: ${now.toISOString()}

For more information, please visit https://www.owfn.org`;
            
            const encodedMessage = new TextEncoder().encode(message);
            await signMessage(encodedMessage);

            const newSession: SiwsSession = {
                publicKey: publicKey.toBase58(),
                signedAt: now.getTime(),
            };
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
            setSession(newSession);
            setIsLoading(false);
            return true;
        } catch (error) {
            console.error("Sign-in process failed:", error);
            setIsLoading(false);
            await signOut();
            return false;
        }
    }, [publicKey, signMessage, signOut]);

    const isAuthenticated = !!session && session.publicKey === publicKey?.toBase58();

    return {
        isAuthenticated,
        isLoading,
        isSessionLoading,
        session,
        signIn,
        signOut
    };
};
