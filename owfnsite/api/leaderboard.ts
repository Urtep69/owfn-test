import { sql } from '../lib/db.ts';
import type { LeaderboardEntry } from '../types.ts';

export default async function handler(req: any, res: any) {
    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const period = searchParams.get('period') || 'all-time';

        const allowedPeriods: { [key: string]: string } = {
            'weekly': "7 days",
            'monthly': "1 month",
            '3months': "3 months",
            '6months': "6 months",
            '9months': "9 months",
            '1year': "1 year",
            'all-time': ""
        };
        
        const interval = allowedPeriods[period];
        if (interval === undefined) {
             return new Response(JSON.stringify({ error: 'Invalid period specified' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        let query;
        if (period === 'all-time') {
            query = sql`
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
        } else {
            query = sql`
                SELECT 
                    wallet_address, 
                    SUM(amount_usd) as total_donated
                FROM 
                    donations
                WHERE 
                    created_at >= NOW() - INTERVAL ${interval}
                GROUP BY 
                    wallet_address
                ORDER BY 
                    total_donated DESC
                LIMIT 10;
            `;
        }

        const { rows } = await query;
        
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