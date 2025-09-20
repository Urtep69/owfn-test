import { sql } from '@vercel/postgres';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: any) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const { rows: participants } = await sql`
      SELECT wallet_address, created_at 
      FROM airdrop_participants 
      ORDER BY created_at DESC;
    `;
    
    const responseData = {
      totalParticipants: participants.length,
      participants: participants,
    };
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Database Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch airdrop participants.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}