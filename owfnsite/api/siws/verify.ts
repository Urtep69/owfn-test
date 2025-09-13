import { serialize } from 'cookie';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import * as jose from 'jose';

// Această funcție trebuie să fie identică cu cea de pe partea client.
const buildSiwsMessage = (domain: string, publicKey: string, statement: string, uri: string, nonce: string, issuedAt: string) => {
    return `${domain} wants you to sign in with your Solana account:\n` +
           `${publicKey}\n\n` +
           `${statement}\n\n` +
           `URI: ${uri}\n` +
           `Version: 1\n` +
           `Chain ID: 1\n` + // 1 pentru Solana Mainnet
           `Nonce: ${nonce}\n` +
           `Issued At: ${issuedAt}`;
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { signature, publicKey, issuedAt, domain, uri, challengeToken } = req.body;
        if (!signature || !publicKey || !issuedAt || !domain || !uri || !challengeToken) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET environment variable is not set.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }
        const secretKey = new TextEncoder().encode(jwtSecret);

        // --- Verifică jetonul de provocare și extrage nonce-ul ---
        let nonce: string;
        try {
            const { payload } = await jose.jwtVerify(challengeToken, secretKey);
            if (typeof payload.nonce !== 'string') {
                throw new Error('Invalid challenge token payload');
            }
            nonce = payload.nonce;
        } catch (jwtError) {
            console.warn("Challenge token verification failed:", jwtError);
            return res.status(401).json({ error: 'Invalid or expired sign-in challenge.' });
        }

        // --- Verifică timestamp-ul pentru a preveni atacurile de reluare ---
        const now = new Date();
        const issueDate = new Date(issuedAt);
        const fiveMinutes = 5 * 60 * 1000;
        if (now.getTime() - issueDate.getTime() > fiveMinutes) {
            return res.status(400).json({ error: 'Sign-in request has expired.' });
        }

        // --- Reconstruiește și verifică mesajul folosind nonce-ul din jeton ---
        const message = buildSiwsMessage(domain, publicKey, 'Sign in to the Official World Family Network.', uri, nonce, issuedAt);
        const messageBytes = new TextEncoder().encode(message);
        const publicKeyBytes = bs58.decode(publicKey);
        const signatureBytes = bs58.decode(signature);
        const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

        if (!verified) {
            return res.status(401).json({ error: 'Invalid signature.' });
        }
        
        // --- Creează sesiunea JWT ---
        const sessionToken = await new jose.SignJWT({ publicKey })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secretKey);

        // --- Setează cookie-ul de sesiune ---
        res.setHeader('Set-Cookie', serialize('siws-session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax', // Folosește 'lax' pentru o mai bună compatibilitate
            path: '/',
            maxAge: 60 * 60 * 24 // 24 de ore
        }));

        res.status(200).json({ success: true, publicKey: publicKey });

    } catch (error) {
        console.error("Error in SIWS verify handler:", error);
        res.status(500).json({ error: 'Verification failed due to a server error.' });
    }
}