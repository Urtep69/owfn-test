import { sql } from '@vercel/postgres';
import { createTables } from '../lib/db.ts';

// Helper to create a URL-friendly slug
const createSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

export default async function handler(req: any, res: any) {
    try {
        await createTables();

        if (req.method === 'GET') {
            const { rows } = await sql`SELECT * FROM blog_posts ORDER BY created_at DESC;`;
             const posts = rows.map(row => ({
                id: row.id,
                slug: row.slug,
                title: row.title,
                content: row.content,
                imageUrl: row.image_url,
                authorAddress: row.author_address,
                createdAt: row.created_at.toISOString(),
            }));
            return res.status(200).json(posts);
        }

        if (req.method === 'POST') {
            // Add admin authentication here in a real app
            const { title, content, imageUrl, authorAddress } = req.body;
            
            if (!title || !content || !imageUrl || !authorAddress) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const englishTitle = title.en || Object.values(title)[0] as string;
            const slug = createSlug(englishTitle) + '-' + Date.now().toString().slice(-6);

            const result = await sql`
                INSERT INTO blog_posts (slug, title, content, image_url, author_address)
                VALUES (${slug}, ${JSON.stringify(title)}, ${JSON.stringify(content)}, ${imageUrl}, ${authorAddress})
                RETURNING *;
            `;
            
            const newPostRaw = result.rows[0];
            const newPost = {
                 id: newPostRaw.id,
                slug: newPostRaw.slug,
                title: newPostRaw.title,
                content: newPostRaw.content,
                imageUrl: newPostRaw.image_url,
                authorAddress: newPostRaw.author_address,
                createdAt: newPostRaw.created_at.toISOString(),
            };

            return res.status(201).json(newPost);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}