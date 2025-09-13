import { generateNonce, createSessionCookie } from './session.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const nonce = generateNonce();
        const nonceSession = { nonce };
        const cookie = createSessionCookie(nonceSession, 60 * 5); // 5-minute validity for nonce

        res.setHeader('Set-Cookie', cookie);
        res.status(200).json({ nonce });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}