import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { rows } = await sql`
      SELECT 
        id, 
        recipient_name as "recipientName", 
        recipient_address as "recipientAddress", 
        total_amount as "totalAmount",
        claimed_amount as "claimedAmount",
        start_date as "startDate",
        end_date as "endDate",
        cliff_date as "cliffDate"
      FROM vesting_schedules 
      ORDER BY total_amount DESC;
    `;
    
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(rows);

  } catch (error) {
    console.error('Database Error fetching vesting schedules:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
