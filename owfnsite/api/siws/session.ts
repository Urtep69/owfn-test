import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { serialize } from 'cookie';
import type { UserSession } from '../../lib/types.js';

const SESSION_SECRET = process.env.SESSION_SECRET_KEY;
if (!SESSION_SECRET) {
    console.error("CRITICAL: SESSION_SECRET_KEY environment variable is not set.");
    throw new Error("Server configuration error: Session secret is missing.");
}
const secretBuffer = Buffer.from(SESSION_SECRET, 'hex');

export function sign(data: string): string {
    return createHmac('sha256', secretBuffer).update(data).digest('hex');
}

export function verify(data: string, signature: string): boolean {
    try {
        const expectedSignature = sign(data);
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

    const [sessionStr, signature] = cookie.split('.');
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