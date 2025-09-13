import { parse, serialize } from 'cookie';
import * as jose from 'jose';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
    try {
        const cookies = parse(req.headers.cookie || '');
        const sessionToken = cookies['siws-session'];

        if (!sessionToken) {
            return res.status(401).json({ error: 'Not authenticated.' });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("CRITICAL: JWT_SECRET environment variable is not set.");
            return res.status(500).json({ error: 'Server configuration error.' });
        }
        const secretKey = new TextEncoder().encode(jwtSecret);
        
        const { payload } = await jose.jwtVerify(sessionToken, secretKey);

        if (!payload || typeof payload.publicKey !== 'string') {
             return res.status(401).json({ error: 'Invalid session.' });
        }

        res.status(200).json({ publicKey: payload.publicKey });

    } catch (error) {
        console.warn("JWT verification failed in /me handler:", error);
         res.setHeader('Set-Cookie', serialize('siws-session', '', { 
            maxAge: -1, 
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
        }));
        return res.status(401).json({ error: 'Session expired or invalid.' });
    }
}