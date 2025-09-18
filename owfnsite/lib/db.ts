import { createPool } from '@vercel/postgres';

// This file centralizes the database connection configuration.
// It explicitly creates a connection pool using the `DB_POSTGRES_URL`
// environment variable, which matches the user's Vercel setup.
// All API routes will import `sql` from here to ensure they use the correct
// connection string.
const pool = createPool({
  connectionString: process.env.DB_POSTGRES_URL,
});

export const { sql } = pool;
