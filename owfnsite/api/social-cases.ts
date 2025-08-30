import { sql } from '@vercel/postgres';
import type { SocialCase } from '../types.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { rows } = await sql`
      SELECT id, title, description, details, category, image_url as "imageUrl", goal, donated 
      FROM social_cases 
      ORDER BY created_at DESC;
    `;
    
    const cases: SocialCase[] = rows.map((row: any): SocialCase => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      imageUrl: row.imageUrl,
      goal: parseFloat(row.goal),
      donated: parseFloat(row.donated),
      details: row.details,
    }));
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(cases);

  } catch (error) {
    console.error('Database Error fetching social cases:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
