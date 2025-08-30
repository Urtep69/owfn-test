import { sql } from '../lib/db.ts';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { 
            wallet_address, 
            token_symbol, 
            token_amount, 
            amount_usd, 
            transaction_signature, 
            cause_id 
        } = req.body;

        if (!wallet_address || !token_symbol || token_amount === undefined || amount_usd === undefined || !transaction_signature) {
             return new Response(JSON.stringify({ error: 'Missing required donation fields.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await sql`
            INSERT INTO donations (wallet_address, token_symbol, token_amount, amount_usd, transaction_signature, cause_id)
            VALUES (${wallet_address}, ${token_symbol}, ${token_amount}, ${amount_usd}, ${transaction_signature}, ${cause_id || null});
        `;
        
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error recording donation:', error);
        return new Response(JSON.stringify({ error: 'Failed to record donation' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}