import { sql } from '@vercel/postgres';

// This configuration automatically uses the POSTGRES_URL, POSTGRES_URL_NON_POOLING,
// etc., environment variables provided by Vercel.
// We will use the non-pooling client for API routes as recommended by Vercel for serverless functions.
export { sql };
