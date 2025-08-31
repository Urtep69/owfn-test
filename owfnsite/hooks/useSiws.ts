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
            localStorage.removeItem(SESSION_KEY);
            setSession(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, signMessage]);

    useEffect(() => {
        if (connecting) {
            setIsSessionLoading(true);
            return;
        }

        if (!publicKey) {
            setIsAuthenticated(false);
            setSession(null);
            setIsSessionLoading(false);
            return;
        }
        
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
                        localStorage.removeItem(SESSION_KEY);
                        sessionStorage.removeItem(SESSION_ATTEMPTED_KEY);
                    }
                }
            } catch (error) {
                console.error("Failed to parse or validate SIWS session:", error);
                localStorage.removeItem(SESSION_KEY);
                sessionStorage.removeItem(SESSION_ATTEMPTED_KEY);
            }

            if (!sessionIsValid) {
                setIsAuthenticated(false);
                setSession(null);

                const hasAttempted = sessionStorage.getItem(SESSION_ATTEMPTED_KEY);
                if (!hasAttempted) {
                    sessionStorage.setItem(SESSION_ATTEMPTED_KEY, 'true');
                    signIn();
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
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_ATTEMPTED_KEY);
        setSession(null);
        setIsAuthenticated(false);
    }, [disconnect]);
    
    return { isAuthenticated, isLoading, isSessionLoading, session, signIn, signOut };
};
