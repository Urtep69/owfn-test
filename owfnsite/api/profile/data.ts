import { sql } from '../../lib/db.js';
import type { UserProfileData } from '../../lib/types.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { walletAddress } = req.query;

    if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'A valid walletAddress is required.' });
    }

    try {
        // Fetch submitted cases
        const submittedCasesResult = await sql`
            SELECT id::text, case_uuid, submitter_wallet_address, title, short_description, detailed_description, category, funding_goal, image_url, status, created_at
            FROM SocialCases
            WHERE submitter_wallet_address = ${walletAddress}
            ORDER BY created_at DESC;
        `;

        // Fetch presale contributions
        const presaleContributionsResult = await sql`
            SELECT * FROM PresaleContributions
            WHERE buyer_wallet_address = ${walletAddress}
            ORDER BY "timestamp" DESC;
        `;
        
        // Fetch donations
        const donationsResult = await sql`
            SELECT * FROM Donations
            WHERE donor_wallet_address = ${walletAddress}
            ORDER BY "timestamp" DESC;
        `;

        const profileData: UserProfileData = {
            submittedCases: submittedCasesResult.rows.map(row => ({
                ...row,
                title: row.title,
                description: row.short_description,
                details: row.detailed_description,
                goal: parseFloat(row.funding_goal)
            })) as any,
            presaleContributions: presaleContributionsResult.rows as any,
            donations: donationsResult.rows as any,
        };
        
        return res.status(200).json(profileData);

    } catch (error) {
        console.error(`Error fetching profile data for ${walletAddress}:`, error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
}
