import { clearSessionCookie } from './session.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        res.setHeader('Set-Cookie', clearSessionCookie());
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}