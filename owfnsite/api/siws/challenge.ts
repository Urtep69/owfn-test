import { serialize } from 'cookie';

function generateNonce() {
    return crypto.randomUUID();
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const nonce = generateNonce();
        
        res.setHeader('Set-Cookie', serialize('siws-nonce', nonce, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            path: '/api/siws',
            maxAge: 5 * 60 // 5 minutes
        }));
        
        res.status(200).json({
            nonce: nonce,
            issuedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error in SIWS challenge handler:", error);
        res.status(500).json({ error: "Could not generate challenge." });
    }
}