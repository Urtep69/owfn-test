import * as ed from '@noble/ed25519';
import bs58 from 'bs58';
import { createSessionCookie, getSession } from './session.js';

// Simple SIWS message parser
function parseSiwsMessage(message: string): { domain: string, address: string, nonce: string } | null {
    const lines = message.split('\n');
    try {
        const domain = lines[0].split(' wants you to sign in with your Solana account:')[0];
        const address = lines[1];
        const nonceLine = lines.find(line => line.startsWith('Nonce: '));
        const nonce = nonceLine ? nonceLine.substring(7) : '';

        if (!domain || !address || !nonce) {
            return null;
        }
        return { domain, address, nonce };
    } catch {
        return null;
    }
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { message, signature } = req.body;

        const nonceSession = getSession(req);
        if (!nonceSession || !('nonce' in nonceSession)) {
            return res.status(401).json({ error: 'Invalid or missing nonce session.' });
        }

        const parsedMessage = parseSiwsMessage(message);
        if (!parsedMessage) {
            return res.status(400).json({ error: 'Invalid message format.' });
        }

        if (parsedMessage.nonce !== nonceSession.nonce) {
            return res.status(401).json({ error: 'Nonce mismatch.' });
        }

        // Verify the Solana signature using @noble/ed25519
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = Buffer.from(signature, 'base64');
        const publicKeyBytes = bs58.decode(parsedMessage.address);

        // CORRECT FIX: Use the explicitly named `verifyAsync` function. The library's `verify` function
        // is synchronous and requires `utils.sha512Sync` to be set, which fails in some serverless environments.
        // `verifyAsync` is designed to work in these environments without manual setup.
        const isVerified = await ed.verifyAsync(signatureBytes, messageBytes, publicKeyBytes);

        if (!isVerified) {
            return res.status(401).json({ error: 'Signature verification failed.' });
        }

        // Signature is valid, create a user session
        const userSession = {
            publicKey: parsedMessage.address,
            issuedAt: new Date().toISOString(),
        };
        const sessionCookie = createSessionCookie(userSession, 60 * 60 * 24 * 7); // 7-day session

        // Set the new user session cookie. This overwrites the old nonce cookie.
        res.setHeader('Set-Cookie', sessionCookie);
        res.status(200).json(userSession);

    } catch (error) {
        console.error("Error during SIWS verification:", error);
        res.status(500).json({ error: (error as Error).message });
    }
}
