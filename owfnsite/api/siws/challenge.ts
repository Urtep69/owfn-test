import * as jose from 'jose';

function generateNonce() {
    return crypto.randomUUID();
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("CRITICAL: JWT_SECRET environment variable is not set.");
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    try {
        const nonce = generateNonce();
        const issuedAt = new Date().toISOString();
        const secretKey = new TextEncoder().encode(jwtSecret);

        const challengeToken = await new jose.SignJWT({ nonce })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('5m') // Jeton de provocare cu durată scurtă de viață
            .sign(secretKey);
        
        // Nu mai setăm cookie-uri aici
        res.status(200).json({
            nonce,
            issuedAt,
            challengeToken
        });

    } catch (error) {
        console.error("Error in SIWS challenge handler:", error);
        res.status(500).json({ error: "Could not generate challenge." });
    }
}