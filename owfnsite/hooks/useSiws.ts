import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { SiwsReturn, SiwsSession } from '../lib/types.js';
import bs58 from 'bs58';

export const useSiws = (): SiwsReturn => {
    const { publicKey, signMessage, connected } = useWallet();
    const [session, setSession] = useState<SiwsSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    const checkSession = useCallback(async () => {
        setIsSessionLoading(true);
        try {
            const response = await fetch('/api/siws/me');
            if (response.ok) {
                const data = await response.json();
                setSession({ publicKey: data.publicKey });
            } else {
                setSession(null);
            }
        } catch (error) {
            console.error("Could not check session:", error);
            setSession(null);
        } finally {
            setIsSessionLoading(false);
        }
    }, []);
    
    const signOut = useCallback(async () => {
        setIsLoading(true);
        try {
            await fetch('/api/siws/logout', { method: 'POST' });
        } catch (error) {
            console.error("Sign-out failed:", error);
        } finally {
            setSession(null);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);
    
    useEffect(() => {
        if (session && (!connected || publicKey?.toBase58() !== session.publicKey)) {
             signOut();
        }
    }, [connected, publicKey, session, signOut]);

    const signIn = useCallback(async (): Promise<boolean> => {
        if (!publicKey || !signMessage) {
            console.error("Wallet not connected or signMessage not available");
            return false;
        }

        setIsLoading(true);
        try {
            // 1. Get the challenge (nonce) from the server via a secure token
            const challengeRes = await fetch('/api/siws/challenge');
            if (!challengeRes.ok) throw new Error('Failed to get challenge');
            const { nonce, challengeToken } = await challengeRes.json();
            
            // 2. Sign the nonce directly. This is simpler and more robust than signing a complex message.
            const encodedMessage = new TextEncoder().encode(nonce);
            const signatureBytes = await signMessage(encodedMessage);
            const signature = bs58.encode(signatureBytes);

            // 3. Send signature, public key, and the challenge token back for verification.
            const verifyRes = await fetch('/api/siws/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    signature,
                    publicKey: publicKey.toBase58(),
                    challengeToken,
                })
            });

            if (!verifyRes.ok) {
                 const errorData = await verifyRes.json();
                 throw new Error(errorData.error || 'Verification failed');
            }

            const data = await verifyRes.json();
            setSession({ publicKey: data.publicKey });
            return true;

        } catch (error) {
            console.error("Sign-in failed:", error);
            setSession(null);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, signMessage]);


    return {
        isAuthenticated: !!session,
        isLoading,
        isSessionLoading,
        session,
        signIn,
        signOut
    };
};