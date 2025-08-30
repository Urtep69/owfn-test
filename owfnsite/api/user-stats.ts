import { sql } from '../lib/db.ts';
import type { UserStats } from '../types.ts';

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
                SUM(amount_usd) AS total_donated,
                COUNT(*) AS donation_count,
                COUNT(DISTINCT cause_id) AS causes_supported
            FROM 
                donations 
            WHERE 
                wallet_address = ${wallet};
        `;

        const stats = rows[0];

        const userStats: UserStats = {
            totalDonatedUSD: parseFloat(stats.total_donated) || 0,
            causesSupported: parseInt(stats.causes_supported, 10) || 0,
            donationCount: parseInt(stats.donation_count, 10) || 0,
            // Assuming votedProposalIds would come from another table or system
            votedProposalIds: ['prop1', 'prop2', 'prop3', 'prop4', 'prop5'] // Keep mock data for this
        };
        
        return new Response(JSON.stringify(userStats), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 's-maxage=300, stale-while-revalidate=3600', // Cache for 5 mins
            },
        });

    } catch (error) {
        console.error(`Error fetching user stats for ${wallet}:`, error);
        return new Response(JSON.stringify({ error: 'Failed to fetch user statistics' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}