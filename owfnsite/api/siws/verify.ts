import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { parse, serialize } from 'cookie';
import * as jose from 'jose';

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
        const { signature, publicKey, issuedAt } = req.body;
        const cookies = parse(req.headers.cookie || '');
        const nonce = cookies['siws-nonce'];

        if (!signature || !publicKey || !issuedAt || !nonce) {
            return res.status(400).json({ error: 'Missing signature, publicKey, issuedAt, or nonce.' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET environment variable is not set.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }
        const secretKey = new TextEncoder().encode(jwtSecret);
        
        const issuedAtDate = new Date(issuedAt);
        if (Date.now() - issuedAtDate.getTime() > 5 * 60 * 1000) {
            return res.status(400).json({ error: 'Authentication request has expired.' });
        }
        
        const domain = req.headers.host;
        const uri = `https://${domain}`;
        const statement = 'Sign in to the Official World Family Network.';
        const messageToVerify = buildSiwsMessage(domain, publicKey, statement, uri, nonce, issuedAt);
        
        const messageBytes = new TextEncoder().encode(messageToVerify);
        const publicKeyBytes = bs58.decode(publicKey);
        const signatureBytes = bs58.decode(signature);

        const isVerified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        
        if (!isVerified) {
            return res.status(401).json({ error: 'Invalid signature.' });
        }

        const token = await new jose.SignJWT({ publicKey })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer(uri)
            .setAudience(uri)
            .setExpirationTime('24h')
            .sign(secretKey);
        
        res.setHeader('Set-Cookie', [
            serialize('siws-session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 // 24 hours
            }),
            serialize('siws-nonce', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                path: '/api/siws',
                maxAge: -1
            })
        ]);

        res.status(200).json({ publicKey });

    } catch (error) {
        console.error("Error in SIWS verify handler:", error);
        res.status(500).json({ error: 'Verification failed.' });
    }
}