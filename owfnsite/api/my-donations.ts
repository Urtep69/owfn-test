import { sql } from '../lib/db.ts';
import type { DonationHistoryEntry } from '../types.ts';

// In a real application with a `social_cases` table, the query would look like this:
/*
const { rows } = await sql`
    SELECT 
        d.id, d.created_at, d.token_symbol, d.token_amount, d.amount_usd, 
        d.cause_id, sc.title AS cause_title, d.transaction_signature
    FROM 
        donations d
    LEFT JOIN 
        social_cases sc ON d.cause_id = sc.id
    WHERE 
        d.wallet_address = ${wallet}
    ORDER BY 
        d.created_at DESC;
`;
*/
// Since social_cases are not in the DB, we will omit the join for now.

export default async function handler(req: any, res: any) {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
        return new Response(JSON.stringify({ error: 'Wallet address is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { rows } = await sql`
            SELECT 
                id, 
                created_at, 
                token_symbol, 
                token_amount, 
                amount_usd, 
                cause_id, 
                transaction_signature
            FROM 
                donations 
            WHERE 
                wallet_address = ${wallet}
            ORDER BY 
                created_at DESC;
        `;
        
        // Post-process to add a null `cause_title` for now.
        // Once social cases are in the DB, the JOIN will handle this.
        // FIX: The spread operator `...row` was not correctly typed, leading to a type mismatch.
        // Explicitly mapping the properties from the database row to the DonationHistoryEntry interface resolves the issue.
        const history: DonationHistoryEntry[] = rows.map((row): DonationHistoryEntry => ({
            id: row.id,
            created_at: row.created_at,
            token_symbol: row.token_symbol,
            token_amount: parseFloat(row.token_amount),
            amount_usd: parseFloat(row.amount_usd),
            cause_id: row.cause_id,
            cause_title: null,
            transaction_signature: row.transaction_signature
        }));

        return new Response(JSON.stringify(history), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 's-maxage=60, stale-while-revalidate=300', // Cache for 1 min, allow stale for 5 mins
            },
        });

    } catch (error) {
        console.error(`Error fetching donation history for ${wallet}:`, error);
        return new Response(JSON.stringify({ error: 'Failed to fetch donation history' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}