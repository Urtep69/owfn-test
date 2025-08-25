import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { SiwsSession, SiwsReturn } from '../types.ts';

const SESSION_KEY = 'owfn-siws-session';
const SESSION_DURATION = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

export const useSiws = (): SiwsReturn => {
    const { publicKey, signMessage, disconnect, connecting } = useWallet();
    const [session, setSession] = useState<SiwsSession | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);

    useEffect(() => {
        // If the wallet adapter is in the middle of an auto-connect attempt,
        // we are definitely in a loading state. We should wait for it to resolve.
        if (connecting) {
            setIsSessionLoading(true);
            return;
        }

        // If the adapter is NOT connecting and we have NO public key, it means the user
        // is definitively not connected. Session loading is complete, and there's no session.
        if (!publicKey) {
            setIsAuthenticated(false);
            setSession(null);
            setIsSessionLoading(false);
            return;
        }

        // If we reach this point, we have a stable public key and are not in the middle of connecting.
        // This is the correct and only time to check for a session in localStorage.
        try {
            const storedSessionStr = localStorage.getItem(SESSION_KEY);
            if (!storedSessionStr) {
                setIsAuthenticated(false);
                setSession(null);
                // No session found, but the check is complete.
                setIsSessionLoading(false);
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
        } finally {
            // Regardless of whether a session was found or not, the loading process is complete.
            setIsSessionLoading(false);
        }
    }, [publicKey, connecting]);


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
        // Disconnect the wallet adapter first. This will set `connected` to false.
        if (disconnect) {
            await disconnect();
        }
        // THEN, clear local session and update state. This prevents the useEffect in AppContext
        // from re-triggering signIn during the disconnect process.
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        setIsAuthenticated(false);
    }, [disconnect]);
    
    return { isAuthenticated, isLoading, isSessionLoading, session, signIn, signOut };
};