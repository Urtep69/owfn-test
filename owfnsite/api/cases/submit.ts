import { sql } from '@vercel/postgres';
import type { SocialCase } from '../../lib/types.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const {
            walletAddress, title, shortDescription, detailedDescription,
            category, goal, imageUrl, contactName, contactEmail, contactTelegram
        } = req.body;

        // Basic validation
        if (!walletAddress || !title || !shortDescription || !detailedDescription || !category || !goal || !contactName || !contactEmail || !contactTelegram) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        
        // In a real app, you would also validate the wallet signature to confirm ownership
        
        // The title, short_description, and detailed_description are expected to be just strings in 'en' for now.
        // We wrap them in the JSONB structure the DB expects.
        const titleJson = JSON.stringify({ en: title });
        const shortDescJson = JSON.stringify({ en: shortDescription });
        const detailDescJson = JSON.stringify({ en: detailedDescription });

        // Insert into the database
        await sql`
            INSERT INTO SocialCases (
                submitter_wallet_address,
                title,
                short_description,
                detailed_description,
                category,
                funding_goal,
                image_url,
                contact_name,
                contact_email,
                contact_phone_telegram,
                status
            ) VALUES (
                ${walletAddress},
                ${titleJson},
                ${shortDescJson},
                ${detailDescJson},
                ${category},
                ${goal},
                ${imageUrl || null},
                ${contactName},
                ${contactEmail},
                ${contactTelegram},
                'pending_review'
            );
        `;
        
        // TODO: In the future, send an internal notification email to the admin team here.

        return res.status(200).json({ success: true, message: 'Case submitted successfully for review.' });

    } catch (error) {
        console.error('Error in /api/cases/submit:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
}