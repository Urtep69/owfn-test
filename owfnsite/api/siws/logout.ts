import { serialize } from 'cookie';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    res.setHeader('Set-Cookie', serialize('siws-session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        path: '/',
        maxAge: -1
    }));
    
    res.status(200).json({ message: 'Signed out successfully.' });
}