import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { SiwsSession, SiwsReturn } from '../types.ts';

const SESSION_KEY = 'owfn-siws-session';
const SESSION_ATTEMPTED_KEY = 'owfn-siws-attempted';
const SESSION_DURATION = 48 * 60 * 60 * 1000; // 48 hours in milliseconds

export const useSiws = (): SiwsReturn => {
    const { publicKey, signMessage, disconnect, connecting } = useWallet();
    const [session, setSession] = useState<SiwsSession | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);

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
            console.error("SIWS sign-in failed (likely user cancellation):", error);
            // Don't clear session storage here; the user just cancelled.
            // We want to remember the attempt so we don't re-prompt on refresh.
            localStorage.removeItem(SESSION_KEY);
            setSession(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, signMessage]);

    useEffect(() => {
        // While the wallet is in the process of connecting, we are in a loading state.
        if (connecting) {
            setIsSessionLoading(true);
            return;
        }

        // If there's no public key, it means the wallet is disconnected. Reset all states.
        if (!publicKey) {
            setIsAuthenticated(false);
            setSession(null);
            setIsSessionLoading(false);
            return;
        }
        
        // This function now contains the complete, sequential logic for checking a session and then deciding to sign in.
        // This avoids race conditions between multiple useEffects.
        const checkAndSignIn = async () => {
            setIsSessionLoading(true);
            let sessionIsValid = false;

            try {
                const storedSessionStr = localStorage.getItem(SESSION_KEY);
                if (storedSessionStr) {
                    const storedSession: SiwsSession = JSON.parse(storedSessionStr);
                    sessionIsValid =
                        storedSession.publicKey === publicKey.toBase58() &&
                        (Date.now() - storedSession.signedAt) < SESSION_DURATION;
                    
                    if (sessionIsValid) {
                        setSession(storedSession);
                        setIsAuthenticated(true);
                    } else {
                        // The session is expired or invalid. Clear it and also clear the attempt flag
                        // to allow for a new sign-in prompt when the session expires.
                        localStorage.removeItem(SESSION_KEY);
                        sessionStorage.removeItem(SESSION_ATTEMPTED_KEY);
                    }
                }
            } catch (error) {
                console.error("Failed to parse or validate SIWS session:", error);
                localStorage.removeItem(SESSION_KEY);
                sessionStorage.removeItem(SESSION_ATTEMPTED_KEY);
            }

            // This block runs ONLY if no valid session was found above.
            if (!sessionIsValid) {
                setIsAuthenticated(false);
                setSession(null);

                // We use sessionStorage to track if we've already tried to sign in during this browser session.
                // This prevents re-prompting on every page refresh if the user cancels the initial prompt.
                const hasAttempted = sessionStorage.getItem(SESSION_ATTEMPTED_KEY);
                if (!hasAttempted) {
                    sessionStorage.setItem(SESSION_ATTEMPTED_KEY, 'true');
                    signIn(); // This is non-blocking. The UI will update based on loading states.
                }
            }
            
            setIsSessionLoading(false);
        };

        checkAndSignIn();
        
    }, [publicKey, connecting, signIn]);

    const signOut = useCallback(async () => {
        if (disconnect) {
            await disconnect();
        }
        // On an explicit sign-out, clear everything to ensure a clean state for the next connection.
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_ATTEMPTED_KEY);
        setSession(null);
        setIsAuthenticated(false);
    }, [disconnect]);
    
    return { isAuthenticated, isLoading, isSessionLoading, session, signIn, signOut };
};