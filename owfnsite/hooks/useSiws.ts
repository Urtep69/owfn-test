import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { SiwsSession, SiwsReturn } from '../types.ts';
import { useLocalization } from './useLocalization.ts';

const SESSION_KEY = 'owfn-siws-session';

export const useSiws = (): SiwsReturn => {
    const { publicKey, signMessage } = useWallet();
    const { t } = useLocalization();
    const [session, setSession] = useState<SiwsSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    useEffect(() => {
        try {
            const storedSession = window.localStorage.getItem(SESSION_KEY);
            if (storedSession) {
                const parsed: SiwsSession = JSON.parse(storedSession);
                // On mount, if a wallet is connected, check if the stored session matches.
                if (publicKey && parsed.publicKey === publicKey.toBase58()) {
                    setSession(parsed);
                } else if (publicKey && parsed.publicKey !== publicKey.toBase58()) {
                    // Wallet changed, invalidate session
                    window.localStorage.removeItem(SESSION_KEY);
                    setSession(null);
                }
            }
        } catch (e) {
            console.warn("Could not load SIWS session from localStorage", e);
        } finally {
            setIsSessionLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedSession = window.localStorage.getItem(SESSION_KEY);
        if (publicKey) {
            if (storedSession) {
                const parsed: SiwsSession = JSON.parse(storedSession);
                if (parsed.publicKey === publicKey.toBase58()) {
                    setSession(parsed);
                } else {
                    window.localStorage.removeItem(SESSION_KEY);
                    setSession(null);
                }
            }
        } else {
            setSession(null);
        }
    }, [publicKey]);

    const signIn = useCallback(async (): Promise<boolean> => {
        if (!publicKey || !signMessage) {
            console.error("Wallet not connected or does not support signMessage");
            return false;
        }

        setIsLoading(true);
        try {
            const issuedAt = new Date().toISOString();
            const statement = t('siws_message_statement', { defaultValue: "Sign this message to authenticate with Official World Family Network (OWFN)." });
            const domain = window.location.host;
            const noCost = t('siws_message_no_cost', { defaultValue: "This request will not trigger a blockchain transaction or cost any gas fees." });

            const messageToSign = `${statement}\n\n${t('siws_message_uri', { defaultValue: 'Domain' })}: ${domain}\n${t('siws_message_issued_at', { defaultValue: 'Issued At' })}: ${issuedAt}\n\n${noCost}`;
            const encodedMessage = new TextEncoder().encode(messageToSign);
            
            const signature = await signMessage(encodedMessage);

            if (signature) {
                const newSession: SiwsSession = {
                    publicKey: publicKey.toBase58(),
                    signedAt: Date.now(),
                };
                window.localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
                setSession(newSession);
                return true;
            }
            return false;
        } catch (error) {
            console.error("SIWS sign-in error:", error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [publicKey, signMessage, t]);

    const signOut = useCallback(async (): Promise<void> => {
        window.localStorage.removeItem(SESSION_KEY);
        setSession(null);
    }, []);

    const isAuthenticated = !!session && session.publicKey === publicKey?.toBase58();

    return {
        isAuthenticated,
        isLoading,
        isSessionLoading,
        session,
        signIn,
        signOut,
    };
};