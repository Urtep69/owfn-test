import { sql } from '@vercel/postgres';
import { createTables } from '../lib/db.ts';

export default async function handler(req: any, res: any) {
    try {
        await createTables();

        if (req.method === 'GET') {
            const { parentId } = req.query;
            if (!parentId) {
                return res.status(400).json({ error: 'parentId is required' });
            }
            
            const { rows } = await sql`
                SELECT * FROM comments 
                WHERE parent_id = ${parentId}
                ORDER BY created_at DESC;
            `;

            const comments = rows.map(row => ({
                id: row.id,
                parentId: row.parent_id,
                authorAddress: row.author_address,
                content: row.content,
                createdAt: row.created_at.toISOString(),
            }));

            return res.status(200).json(comments);
        }

        if (req.method === 'POST') {
            // In a real app, you would verify the user's SIWS signature here
            const { parentId, authorAddress, content } = req.body;
            
            if (!parentId || !authorAddress || !content) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const result = await sql`
                INSERT INTO comments (parent_id, author_address, content)
                VALUES (${parentId}, ${authorAddress}, ${content})
                RETURNING *;
            `;
            
            const newCommentRaw = result.rows[0];
            const newComment = {
                id: newCommentRaw.id,
                parentId: newCommentRaw.parent_id,
                authorAddress: newCommentRaw.author_address,
                content: newCommentRaw.content,
                createdAt: newCommentRaw.created_at.toISOString(),
            };

            return res.status(201).json(newComment);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}