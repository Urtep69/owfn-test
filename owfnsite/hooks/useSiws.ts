import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { SiwsSession, SiwsReturn } from '../types.ts';

const SESSION_KEY = 'owfn-siws-session';
const SESSION_DURATION = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

export const useSiws = (): SiwsReturn => {
    const { publicKey, signMessage, disconnect } = useWallet();
    const [session, setSession] = useState<SiwsSession | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const checkSession = useCallback(() => {
        if (!publicKey) {
            setIsAuthenticated(false);
            setSession(null);
            return;
        }

        try {
            const storedSessionStr = localStorage.getItem(SESSION_KEY);
            if (!storedSessionStr) {
                setIsAuthenticated(false);
                return;
            }

            const storedSession: SiwsSession = JSON.parse(storedSessionStr);
            const now = Date.now();

            const isSessionValid = 
                storedSession.publicKey === publicKey.toBase58() &&
                (now - storedSession.signedAt) < SESSION_DURATION;

            if (isSessionValid) {
                setSession(storedSession);
                setIsAuthenticated(true);
            } else {
                localStorage.removeItem(SESSION_KEY);
                setIsAuthenticated(false);
                setSession(null);
            }
        } catch (error) {
            console.error("Failed to check SIWS session:", error);
            localStorage.removeItem(SESSION_KEY);
            setIsAuthenticated(false);
            setSession(null);
        }
    }, [publicKey]);

    useEffect(() => {
        checkSession();
    }, [publicKey, checkSession]);

    const signIn = useCallback(async (): Promise<boolean> => {
        if (!publicKey || !signMessage) {
            console.error("Wallet not connected or signMessage not available.");
            return false;
        }

        setIsLoading(true);
        try {
            const issuedAt = new Date().toISOString();
            const messageToSign = `Sign this message to authenticate with Official World Family Network (OWFN).\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nDomain: www.owfn.org\nIssued At: ${issuedAt}`;
            const messageBytes = new TextEncoder().encode(messageToSign);

            await signMessage(messageBytes);
            
            const newSession: SiwsSession = {
                publicKey: publicKey.toBase58(),
                signedAt: Date.now(),
            };

            localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
            setSession(newSession);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error("SIWS sign-in failed:", error);
            // User likely rejected the request, clear any invalid session
            localStorage.removeItem(SESSION_KEY);
            setSession(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, signMessage]);

    const signOut = useCallback(async () => {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        setIsAuthenticated(false);
        if (disconnect) {
            await disconnect();
        }
    }, [disconnect]);
    
    return { isAuthenticated, isLoading, session, signIn, signOut };
};
