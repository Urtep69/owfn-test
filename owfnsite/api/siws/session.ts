import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { serialize } from 'cookie';
import type { UserSession } from '../../lib/types.js';

let SESSION_SECRET = process.env.SESSION_SECRET_KEY;
// This resilience check prevents the API from crashing if the secret key is not set in the environment.
// For a production environment, this variable MUST be set for security.
if (!SESSION_SECRET) {
    console.warn("---");
    console.warn("CRITICAL SECURITY WARNING: The `SESSION_SECRET_KEY` environment variable is not set.");
    console.warn("A temporary, insecure secret is being generated for this session. This is NOT safe for production.");
    console.warn("Please set a secure, persistent 32-byte hex secret in your deployment environment.");
    console.warn("---");
    SESSION_SECRET = randomBytes(32).toString('hex');
}

// Ensure the secret is a valid hex string before creating a buffer.
const secretBuffer = Buffer.from(SESSION_SECRET, 'hex');

export function sign(data: string): string {
    return createHmac('sha256', secretBuffer).update(data).digest('hex');
}

export function verify(data: string, signature: string): boolean {
    try {
        const expectedSignature = sign(data);
        // Use timingSafeEqual to prevent timing attacks on signature verification.
        return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
        return false;
    }
}

export function createSessionCookie(session: UserSession | { nonce: string }, maxAge: number) {
    const sessionStr = JSON.stringify(session);
    const signature = sign(sessionStr);
    const cookieValue = `${sessionStr}.${signature}`;
    
    return serialize('auth-session', cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: maxAge, // in seconds
        sameSite: 'lax',
    });
}

export function getSession(req: any): UserSession | { nonce: string } | null {
    const cookie = req.cookies['auth-session'];
    if (!cookie) return null;

    const parts = cookie.split('.');
    // A valid signed cookie must have exactly two parts.
    if (parts.length !== 2) return null;

    const [sessionStr, signature] = parts;
    if (!sessionStr || !signature) return null;

    if (verify(sessionStr, signature)) {
        try {
            return JSON.parse(sessionStr);
        } catch {
            return null;
        }
    }
    return null;
}

export function clearSessionCookie() {
    return serialize('auth-session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: -1, // Expire immediately
        sameSite: 'lax',
    });
}

export function generateNonce(): string {
    return randomBytes(32).toString('hex');
}