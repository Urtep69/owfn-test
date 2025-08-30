import { sql } from '../lib/db.ts';
import type { LeaderboardEntry } from '../types.ts';

export default async function handler(req: any, res: any) {
    try {
        // In a real app, you would use the 'period' query parameter to change the query
        // const { period } = req.query; 

        // Query to get top 10 donors by total donated USD
        const { rows } = await sql`
            SELECT 
                wallet_address, 
                SUM(amount_usd) as total_donated
            FROM 
                donations
            GROUP BY 
                wallet_address
            ORDER BY 
                total_donated DESC
            LIMIT 10;
        `;

        const leaderboardData: LeaderboardEntry[] = rows.map((row, index) => ({
            rank: index + 1,
            address: row.wallet_address,
            totalDonatedUSD: parseFloat(row.total_donated)
        }));

        return new Response(JSON.stringify(leaderboardData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 's-maxage=60, stale-while-revalidate=300', // Cache for 1 min, allow stale for 5 mins
            },
        });

    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch leaderboard data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}