import { sql } from '../lib/db.ts';
import type { ImpactBadge } from '../types.ts';

export const config = {
  runtime: 'edge',
};

const ALL_BADGES: Omit<ImpactBadge, 'unlocked'>[] = [
    { id: 'first_donor', titleKey: 'badge_first_donor_title', descriptionKey: 'badge_first_donor_desc', icon: 'Heart' },
    { id: 'health_hero', titleKey: 'badge_health_hero_title', descriptionKey: 'badge_health_hero_desc', icon: 'HeartHandshake' },
    { id: 'active_voter', titleKey: 'badge_active_voter_title', descriptionKey: 'badge_active_voter_desc', icon: 'Vote' },
];

export default async function handler(req: any, res: any) {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
        return new Response(JSON.stringify({ error: 'Wallet address is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Fetch user's donation count from the database
        const { rows: donationRows } = await sql`
            SELECT COUNT(*) as count FROM donations WHERE wallet_address = ${wallet};
        `;
        const donationCount = parseInt(donationRows[0]?.count, 10) || 0;

        // In a real app, you would fetch vote count from a 'votes' table
        // const { rows: voteRows } = await sql`SELECT COUNT(*) as count FROM votes WHERE wallet_address = ${wallet};`;
        // const voteCount = parseInt(voteRows[0]?.count, 10) || 0;
        const voteCount = 5; // Using mock value as 'votes' table is not defined

        const checkUnlockedStatus = (badgeId: string): boolean => {
            switch (badgeId) {
                case 'first_donor':
                    return donationCount > 0;
                case 'health_hero':
                    // This would require a more complex query, e.g., SUM(amount_usd) WHERE category = 'Health'
                    // For now, we'll keep it simple and unlock it if they have made any donation.
                    return donationCount > 0;
                case 'active_voter':
                    return voteCount >= 5;
                default:
                    return false;
            }
        };

        const userBadges = ALL_BADGES.map(badge => ({
            ...badge,
            unlocked: checkUnlockedStatus(badge.id)
        }));

        return new Response(JSON.stringify(userBadges), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 's-maxage=300, stale-while-revalidate=3600',
            },
        });

    } catch (error) {
        console.error(`Error fetching badges for ${wallet}:`, error);
        return new Response(JSON.stringify({ error: 'Failed to fetch badge data' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}