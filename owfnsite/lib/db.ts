import { createPool } from '@vercel/postgres';

// This file centralizes the database connection configuration.
// By calling createPool() without arguments, we allow the Vercel Postgres
// library to automatically find the correct connection string from the
// standard environment variables (POSTGRES_URL, etc.) set by the Vercel integration.
// This is the most robust and recommended approach.
const pool = createPool();

export const { sql } = pool;
