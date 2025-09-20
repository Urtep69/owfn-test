import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: any) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { walletAddress } = await req.json();

        if (!walletAddress || typeof walletAddress !== 'string' || walletAddress.length < 32 || walletAddress.length > 44) {
            return new Response(JSON.stringify({ success: false, error: 'Invalid wallet address provided.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // Ensure the table exists before inserting. This is idempotent and safe.
        await sql`
            CREATE TABLE IF NOT EXISTS airdrop_participants (
                wallet_address VARCHAR(44) PRIMARY KEY,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;

        await sql`
            INSERT INTO airdrop_participants (wallet_address)
            VALUES (${walletAddress});
        `;
        
        return new Response(JSON.stringify({ success: true, message: 'Successfully registered for airdrop.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        // Check for unique constraint violation (Postgres error code 23505)
        if (error.code === '23505') {
            return new Response(JSON.stringify({ success: false, error: 'Wallet address is already registered.' }), {
                status: 409, // Conflict
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        console.error('Airdrop signup database error:', error);
        return new Response(JSON.stringify({ success: false, error: 'An error occurred during registration.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}