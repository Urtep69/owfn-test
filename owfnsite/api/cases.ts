import { sql } from '@vercel/postgres';
import { createTables } from '../lib/db.ts';

export default async function handler(req: any, res: any) {
    try {
        // Ensure tables exist before any operation
        await createTables();

        if (req.method === 'GET') {
            const { rows } = await sql`SELECT * FROM social_cases ORDER BY created_at DESC;`;
            // Map snake_case from DB to camelCase for JS
            const cases = rows.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
                details: row.details,
                category: row.category,
                imageUrls: row.image_urls,
                goal: parseFloat(row.goal),
                donated: parseFloat(row.donated),
                country: row.country,
                region: row.region,
                bankAccountIBAN: row.bank_account_iban,
                beneficiaryCount: row.beneficiary_count,
                createdAt: row.created_at.toISOString(),
                status: row.status,
            }));
            return res.status(200).json(cases);
        }

        if (req.method === 'POST') {
            // Note: In a real app, you would add admin authentication here
            const { 
                title, description, details, category, imageUrls, goal, 
                country, region, bankAccountIBAN, beneficiaryCount 
            } = req.body;

            if (!title || !description || !details || !category || !imageUrls || !goal || !country || !region || !beneficiaryCount) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const result = await sql`
                INSERT INTO social_cases (
                    title, description, details, category, image_urls, goal, 
                    country, region, bank_account_iban, beneficiary_count
                ) VALUES (
                    ${JSON.stringify(title)}, ${JSON.stringify(description)}, ${JSON.stringify(details)}, ${category}, 
                    ${imageUrls}, ${goal}, ${country}, ${region}, ${bankAccountIBAN}, ${beneficiaryCount}
                ) RETURNING *;
            `;
            
            const newCaseRaw = result.rows[0];
            const newCase = {
                id: newCaseRaw.id,
                title: newCaseRaw.title,
                description: newCaseRaw.description,
                details: newCaseRaw.details,
                category: newCaseRaw.category,
                imageUrls: newCaseRaw.image_urls,
                goal: parseFloat(newCaseRaw.goal),
                donated: parseFloat(newCaseRaw.donated),
                country: newCaseRaw.country,
                region: newCaseRaw.region,
                bankAccountIBAN: newCaseRaw.bank_account_iban,
                beneficiaryCount: newCaseRaw.beneficiary_count,
                createdAt: newCaseRaw.created_at.toISOString(),
                status: newCaseRaw.status,
            };

            return res.status(201).json(newCase);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}