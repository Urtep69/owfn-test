import { verify as verifySignature } from 'crypto';
import bs58 from 'bs58';
import { createSessionCookie, getSession, clearSessionCookie } from './session.js';

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

        // Directly use a key object configuration for verification instead of creating a KeyObject first.
        // This is a more direct and robust method that avoids potential subtle issues with createPublicKey
        // in some serverless environments.
        const keyObjectForVerify = {
            key: publicKeyBytes,
            format: 'raw',
            type: 'ed25519'
        };

        const isVerified = verifySignature(undefined, messageBytes, keyObjectForVerify as any, signatureBytes);

        if (!isVerified) {
            return res.status(401).json({ error: 'Signature verification failed.' });
        }

        // Signature is valid, create a user session
        const userSession = {
            publicKey: parsedMessage.address,
            issuedAt: new Date().toISOString(),
        };
        const sessionCookie = createSessionCookie(userSession, 60 * 60 * 24 * 7); // 7-day session

        // Set the new session cookie and clear the old nonce cookie
        res.setHeader('Set-Cookie', [sessionCookie, clearSessionCookie()]);
        res.status(200).json(userSession);

    } catch (error) {
        console.error("Error during SIWS verification:", error);
        res.status(500).json({ error: (error as Error).message });
    }
}
