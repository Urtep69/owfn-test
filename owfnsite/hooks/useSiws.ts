import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { SiwsSession, SiwsReturn } from '../types.ts';

const SESSION_KEY = 'owfn-siws-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useSiws = (): SiwsReturn => {
    const { publicKey, signMessage, connected } = useWallet();
    const [session, setSession] = useState<SiwsSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    // Load session from localStorage on initial mount
    useEffect(() => {
        setIsSessionLoading(true);
        try {
            const storedSession = window.localStorage.getItem(SESSION_KEY);
            if (storedSession) {
                const parsed: SiwsSession = JSON.parse(storedSession);
                const isExpired = Date.now() - parsed.signedAt > SESSION_DURATION;
                if (!isExpired) {
                    setSession(parsed); // Load session from storage if not expired
                } else {
                    window.localStorage.removeItem(SESSION_KEY); // Clear expired session
                    setSession(null);
                }
            }
        } catch (error) {
            console.warn("Could not load SIWS session from localStorage", error);
            window.localStorage.removeItem(SESSION_KEY);
        } finally {
            setIsSessionLoading(false);
        }
    }, []); // Empty dependency array runs only on mount.

    // Effect to validate the loaded session against the connected wallet, or clear on disconnect.
    useEffect(() => {
        if (session && (!connected || publicKey?.toBase58() !== session.publicKey)) {
            setSession(null);
            try {
                window.localStorage.removeItem(SESSION_KEY);
            } catch (e) { /* ignore */ }
        }
    }, [connected, publicKey, session]);


    const createSiwsMessage = (address: string, issuedAt: string): string => {
        return `${window.location.host} wants you to sign in with your Solana account:\n${address}\n\nThis will not trigger a transaction and will not cost any gas fees.\n\nIssued At: ${issuedAt}`;
    };

    const signIn = useCallback(async (): Promise<boolean> => {
        if (!publicKey || !signMessage) {
            console.error('Wallet not connected or signMessage not available.');
            return false;
        }
        setIsLoading(true);
        try {
            const issuedAt = new Date().toISOString();
            const message = createSiwsMessage(publicKey.toBase58(), issuedAt);
            const encodedMessage = new TextEncoder().encode(message);
            
            // The signature is proof of ownership. On a real backend, you'd send this signature
            // for verification. Client-side, the act of signing without error is our verification.
            await signMessage(encodedMessage);
            
            const newSession: SiwsSession = {
                publicKey: publicKey.toBase58(),
                signedAt: Date.now(),
            };
            
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
            setSession(newSession);
            return true;
        } catch (error) {
            console.error("SIWS sign-in error:", error);
            // Clear any potentially broken session
            window.localStorage.removeItem(SESSION_KEY);
            setSession(null);
            return false;
        } finally {
             setIsLoading(false);
        }
    }, [publicKey, signMessage]);

    const signOut = useCallback(async (): Promise<void> => {
        setSession(null);
        try {
            window.localStorage.removeItem(SESSION_KEY);
        } catch (error) {
            console.error("Could not remove SIWS session from localStorage", error);
        }
    }, []);

    const isAuthenticated = !!session && publicKey?.toBase58() === session.publicKey;

    return {
        isAuthenticated,
        isLoading,
        isSessionLoading,
        session,
        signIn,
        signOut,
    };
};
