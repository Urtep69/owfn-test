import { useState, useEffect, useCallback, useRef } from 'react';
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
    const signInAttempted = useRef(false);

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
            localStorage.removeItem(SESSION_KEY);
            setSession(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, signMessage]);

    // Effect to check for an existing session in localStorage
    useEffect(() => {
        if (connecting) {
            setIsSessionLoading(true);
            return;
        }

        if (!publicKey) {
            setIsAuthenticated(false);
            setSession(null);
            setIsSessionLoading(false);
            signInAttempted.current = false; // Reset on disconnect
            return;
        }

        try {
            const storedSessionStr = localStorage.getItem(SESSION_KEY);
            if (!storedSessionStr) {
                setIsAuthenticated(false);
                setSession(null);
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
            setIsSessionLoading(false);
        }
    }, [publicKey, connecting]);

    // Effect to trigger auto sign-in if no valid session is found
    useEffect(() => {
        const shouldAttemptSignIn = 
            !isSessionLoading &&
            publicKey &&
            !connecting &&
            !isAuthenticated &&
            !isLoading &&
            !signInAttempted.current;

        if (shouldAttemptSignIn) {
            signInAttempted.current = true;
            signIn();
        }
    }, [isSessionLoading, isAuthenticated, isLoading, connecting, publicKey, signIn]);


    const signOut = useCallback(async () => {
        if (disconnect) {
            await disconnect();
        }
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
        setIsAuthenticated(false);
        signInAttempted.current = false; // Reset on explicit sign-out
    }, [disconnect]);
    
    return { isAuthenticated, isLoading, isSessionLoading, session, signIn, signOut };
};