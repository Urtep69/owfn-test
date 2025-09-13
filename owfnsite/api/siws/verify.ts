import { createPublicKey, verify as verifySignature } from 'crypto';
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

        // Verify the Solana signature
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = Buffer.from(signature, 'base64');
        const publicKeyBytes = bs58.decode(parsedMessage.address);

        // Create a KeyObject from the raw public key bytes, which is the correct
        // way to prepare the key for the crypto.verify function.
        // FIX: The `crypto.createPublicKey` function expects a Buffer for the 'key' property,
        // but `bs58.decode` returns a Uint8Array. This converts it to the required type.
        const publicKey = createPublicKey({
            key: Buffer.from(publicKeyBytes),
            format: 'raw',
            type: 'ed25519'
        });

        const isVerified = verifySignature(undefined, messageBytes, publicKey, signatureBytes);

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
