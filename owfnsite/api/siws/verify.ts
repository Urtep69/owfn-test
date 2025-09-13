// FIX: The file api/siws/verify.ts was a placeholder and has been implemented to handle the server-side logic for Sign-In with Solana (SIWS). This includes message reconstruction, signature verification, and secure session (JWT) creation.
import { parse, serialize } from 'cookie';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import * as jose from 'jose';

// This function needs to be identical to the one on the client-side.
const buildSiwsMessage = (domain: string, publicKey: string, statement: string, uri: string, nonce: string, issuedAt: string) => {
    return `${domain} wants you to sign in with your Solana account:\n` +
           `${publicKey}\n\n` +
           `${statement}\n\n` +
           `URI: ${uri}\n` +
           `Version: 1\n` +
           `Chain ID: 1\n` + // 1 for Solana Mainnet
           `Nonce: ${nonce}\n` +
           `Issued At: ${issuedAt}`;
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const cookies = parse(req.headers.cookie || '');
        const nonce = cookies['siws-nonce'];

        if (!nonce) {
            return res.status(400).json({ error: 'Nonce not found. Please try signing in again.' });
        }

        const { signature, publicKey, issuedAt } = req.body;
        if (!signature || !publicKey || !issuedAt) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // --- Verify Timestamp to prevent replay attacks ---
        const now = new Date();
        const issueDate = new Date(issuedAt);
        const fiveMinutes = 5 * 60 * 1000;
        if (now.getTime() - issueDate.getTime() > fiveMinutes) {
            return res.status(400).json({ error: 'Sign-in request has expired.' });
        }

        // --- Reconstruct and Verify Message ---
        const message = buildSiwsMessage(
            req.headers.host,
            publicKey,
            'Sign in to the Official World Family Network.',
            new URL(req.url, `https://${req.headers.host}`).origin,
            nonce,
            issuedAt
        );

        const messageBytes = new TextEncoder().encode(message);
        const publicKeyBytes = bs58.decode(publicKey);
        const signatureBytes = bs58.decode(signature);

        const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

        if (!verified) {
            return res.status(401).json({ error: 'Invalid signature.' });
        }
        
        // --- Clear Nonce Cookie ---
        res.setHeader('Set-Cookie', serialize('siws-nonce', '', { maxAge: -1, path: '/api/siws' }));

        // --- Create JWT Session ---
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET environment variable is not set.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }
        const secretKey = new TextEncoder().encode(jwtSecret);
        
        const token = await new jose.SignJWT({ publicKey })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secretKey);

        // --- Set Session Cookie ---
        res.setHeader('Set-Cookie', serialize('siws-session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            path: '/', // Set path to root to be accessible across the app
            maxAge: 60 * 60 * 24 // 24 hours
        }));

        res.status(200).json({ success: true, publicKey: publicKey });

    } catch (error) {
        console.error("Error in SIWS verify handler:", error);
        // Clear nonce on any error to allow retry
        res.setHeader('Set-Cookie', serialize('siws-nonce', '', { maxAge: -1, path: '/api/siws' }));
        res.status(500).json({ error: 'Verification failed.' });
    }
}
