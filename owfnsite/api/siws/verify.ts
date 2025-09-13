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

// Standard DER prefix for an Ed25519 public key in SPKI format.
// This is required for Node.js's native crypto module to correctly interpret the raw key.
const spkiPrefix = Buffer.from([
    0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00,
]);


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

        // Prepend the standard SPKI prefix to the raw public key to create a
        // DER-encoded key that the native crypto module can understand unambiguously.
        const derEncodedPublicKey = Buffer.concat([spkiPrefix, Buffer.from(publicKeyBytes)]);
        
        // Import the key using the standard 'der' and 'spki' formats.
        const publicKey = createPublicKey({
            key: derEncodedPublicKey,
            format: 'der',
            type: 'spki',
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
