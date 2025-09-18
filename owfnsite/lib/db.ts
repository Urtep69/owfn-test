import { createPool } from '@vercel/postgres';

// This is the definitive connection string resolver.
// It checks for the Vercel-provided standard variable, the non-pooling fallback,
// and the custom-prefixed variable seen in the user's screenshot.
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DB_POSTGRES_URL;

// If none of the potential environment variables are found, the application
// cannot connect to the database. We throw an error to halt execution and
// provide a clear error message in the server logs.
if (!connectionString) {
  console.error(
    "FATAL: Database connection string not found. " +
    "Ensure that the Vercel Postgres integration is correctly linked and that " +
    "one of POSTGRES_URL or DB_POSTGRES_URL environment variables is available."
  );
  // We must throw here to prevent the application from trying to run without a DB.
  throw new Error("Database configuration error: Connection string is missing.");
}

// Initialize the connection pool with the resolved connection string.
const pool = createPool({ connectionString });

export const { sql } = pool;
