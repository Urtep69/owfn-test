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
        
        const baseQuery = `
            SELECT
                wallet_address,
                SUM(amount_usd) AS total_donated,
                json_agg(
                    json_build_object(
                        'symbol', token_symbol,
                        'totalAmount', total_token_amount,
                        'totalUSD', total_token_usd,
                        'lastDonationDate', last_donation
                    )
                ) as donations_by_token
            FROM (
                SELECT
                    wallet_address,
                    token_symbol,
                    SUM(token_amount) as total_token_amount,
                    SUM(amount_usd) as total_token_usd,
                    MAX(created_at) as last_donation
                FROM donations
        `;

        const endQuery = `
                GROUP BY wallet_address, token_symbol
            ) as user_token_summary
            GROUP BY wallet_address
            ORDER BY total_donated DESC
            LIMIT 100;
        `;
        
        let result;
        if (period === 'all-time') {
             result = await sql.query(baseQuery + endQuery);
        } else {
             result = await sql.query(baseQuery + ` WHERE created_at >= NOW() - INTERVAL '${interval}'` + endQuery);
        }

        const { rows } = result;

        const leaderboardData: LeaderboardEntry[] = rows.map((row, index) => ({
            rank: index + 1,
            address: row.wallet_address,
            totalDonatedUSD: parseFloat(row.total_donated),
            donationsByToken: row.donations_by_token.map((d: any) => ({
                ...d,
                totalAmount: parseFloat(d.totalamount),
                totalUSD: parseFloat(d.totalusd)
            }))
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
