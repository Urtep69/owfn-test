import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { createSiwsMessage } from '../lib/siws.js';
import type { SiwsReturn, UserSession } from '../lib/types.js';
import { Buffer } from 'buffer';

export const useSiws = (): SiwsReturn => {
    const { publicKey, signMessage, connected } = useWallet();
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<UserSession | null>(null);

    const checkSession = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/siws/me');
            if (response.ok) {
                const data = await response.json();
                setSession(data);
            } else {
                setSession(null);
            }
        } catch (error) {
            console.error('Failed to check SIWS session:', error);
            setSession(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const signIn = useCallback(async (): Promise<boolean> => {
        if (!connected || !publicKey || !signMessage) {
            console.error('Wallet not connected or signMessage not available.');
            return false;
        }

        setIsLoading(true);
        try {
            const nonceResponse = await fetch('/api/siws/nonce');
            if (!nonceResponse.ok) throw new Error('Failed to fetch nonce.');
            const { nonce } = await nonceResponse.json();

            const message = createSiwsMessage({
                domain: window.location.host,
                address: publicKey.toBase58(),
                uri: window.location.origin,
                version: '1',
                chainId: 'mainnet',
                nonce,
                issuedAt: new Date().toISOString(),
            });

            const encodedMessage = new TextEncoder().encode(message);
            const signature = await signMessage(encodedMessage);
            
            // Use Buffer for robust Base64 encoding
            const serializedSignature = Buffer.from(signature).toString('base64');

            const verifyResponse = await fetch('/api/siws/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, signature: serializedSignature }),
            });

            if (verifyResponse.ok) {
                const data = await verifyResponse.json();
                setSession(data);
                return true;
            }
            throw new Error('Verification failed.');
        } catch (error) {
            console.error('Sign-In with Solana failed:', error);
            setSession(null);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [connected, publicKey, signMessage]);

    const signOut = useCallback(async () => {
        setIsLoading(true);
        try {
            await fetch('/api/siws/signout', { method: 'POST' });
        } catch (error) {
            console.error('Failed to sign out:', error);
        } finally {
            setSession(null);
            setIsLoading(false);
        }
    }, []);

    return {
        isAuthenticated: !!session,
        isLoading,
        session,
        signIn,
        signOut,
    };
};