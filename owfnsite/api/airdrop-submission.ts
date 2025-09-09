import { sql } from '@vercel/postgres';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export default async function handler(req: any, res: any) {
    if (req.method === 'GET') {
        const { walletAddress } = req.query;
        if (!walletAddress || typeof walletAddress !== 'string') {
            return res.status(400).json({ error: 'Wallet address is required.' });
        }
        try {
            const { rows } = await sql`
                SELECT 1 FROM airdrop_submissions WHERE wallet_address = ${walletAddress} LIMIT 1;
            `;
            return res.status(200).json({ hasSubmitted: rows.length > 0 });
        } catch (error) {
            console.error('Database error checking airdrop status:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { walletAddress, message, signature, signedMessage } = req.body;

            if (!walletAddress || !message || !signature || !signedMessage) {
                return res.status(400).json({ error: 'Missing required fields.' });
            }

            // --- Signature Verification ---
            const messageBytes = new TextEncoder().encode(signedMessage);
            const publicKeyBytes = bs58.decode(walletAddress);
            const signatureBytes = Buffer.from(signature, 'base64');
            
            const isVerified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

            if (!isVerified) {
                return res.status(403).json({ error: 'Invalid signature. Authentication failed.' });
            }
            
            // --- Check for existing submission ---
            const { rows: existing } = await sql`
                SELECT 1 FROM airdrop_submissions WHERE wallet_address = ${walletAddress} LIMIT 1;
            `;
            if (existing.length > 0) {
                return res.status(409).json({ error: 'This wallet has already submitted an application.' });
            }
            
            // --- Insert into database ---
            await sql`
                INSERT INTO airdrop_submissions (wallet_address, message)
                VALUES (${walletAddress}, ${message});
            `;

            return res.status(201).json({ success: true, message: 'Submission received successfully.' });

        } catch (error: any) {
            console.error('Airdrop submission error:', error);
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({ error: 'This wallet has already submitted an application.' });
            }
            return res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}