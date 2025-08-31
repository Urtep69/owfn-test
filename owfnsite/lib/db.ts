import { sql } from '@vercel/postgres';

// A singleton promise to ensure createTables is only called once per instance.
let createTablesPromise: Promise<void> | null = null;

export function createTables() {
    if (createTablesPromise) {
        return createTablesPromise;
    }

    createTablesPromise = (async () => {
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS social_cases (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    title JSONB NOT NULL,
                    description JSONB NOT NULL,
                    details JSONB NOT NULL,
                    category VARCHAR(255) NOT NULL,
                    image_urls TEXT[] NOT NULL,
                    goal NUMERIC NOT NULL,
                    donated NUMERIC NOT NULL DEFAULT 0,
                    country VARCHAR(255) NOT NULL,
                    region VARCHAR(255) NOT NULL,
                    bank_account_iban VARCHAR(255),
                    beneficiary_count INTEGER NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    status VARCHAR(50) NOT NULL DEFAULT 'active'
                );
            `;

            await sql`
                CREATE TABLE IF NOT EXISTS blog_posts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    title JSONB NOT NULL,
                    content JSONB NOT NULL,
                    image_url TEXT NOT NULL,
                    author_address VARCHAR(255) NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            `;

            await sql`
                CREATE TABLE IF NOT EXISTS comments (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    parent_id UUID NOT NULL,
                    author_address VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            `;
        } catch (error) {
             // In case of error, reset the promise to allow retries on subsequent requests.
            createTablesPromise = null;
            throw error;
        }
    })();
    
    return createTablesPromise;
}
