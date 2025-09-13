import { serialize } from 'cookie';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import * as jose from 'jose';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { signature, publicKey, challengeToken } = req.body;
        if (!signature || !publicKey || !challengeToken) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET environment variable is not set.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }
        const secretKey = new TextEncoder().encode(jwtSecret);

        // --- Step 1: Verify the challenge token and extract the nonce ---
        let nonce: string;
        try {
            const { payload } = await jose.jwtVerify(challengeToken, secretKey);
            if (typeof payload.nonce !== 'string' || !payload.iat) {
                throw new Error('Invalid challenge token payload');
            }
            
            // Check expiry directly from payload
            const issueDate = new Date(payload.iat * 1000);
            const fiveMinutes = 5 * 60 * 1000;
            if (Date.now() - issueDate.getTime() > fiveMinutes) {
                 throw new Error('Challenge has expired');
            }
            
            nonce = payload.nonce;
        } catch (jwtError: any) {
            console.warn("Challenge token verification failed:", jwtError.message);
            return res.status(401).json({ error: 'Invalid or expired sign-in challenge.' });
        }

        // --- Step 2: Verify the signature against the nonce ---
        const messageBytes = new TextEncoder().encode(nonce);
        const publicKeyBytes = bs58.decode(publicKey);
        const signatureBytes = bs58.decode(signature);
        const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

        if (!verified) {
            return res.status(401).json({ error: 'Invalid signature. The message signed does not match the challenge.' });
        }
        
        // --- Step 3: Create the session JWT ---
        const sessionToken = await new jose.SignJWT({ publicKey })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secretKey);

        // --- Step 4: Set the session cookie ---
        res.setHeader('Set-Cookie', serialize('siws-session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        }));

        res.status(200).json({ success: true, publicKey: publicKey });

    } catch (error) {
        console.error("Error in SIWS verify handler:", error);
        res.status(500).json({ error: 'Verification failed due to a server error.' });
    }
}