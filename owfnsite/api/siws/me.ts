import { getSession } from './session.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const session = getSession(req);
        if (session && 'publicKey' in session) {
            res.status(200).json(session);
        } else {
            res.status(401).json({ error: 'Not authenticated.' });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
}