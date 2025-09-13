import { createHmac, timingSafeEqual, randomBytes } from 'crypto';
import { serialize, parse } from 'cookie';
import type { UserSession } from '../../lib/types.js';

let SESSION_SECRET: string;

if (process.env.SESSION_SECRET_KEY) {
    SESSION_SECRET = process.env.SESSION_SECRET_KEY;
} else if (process.env.GEMINI_API_KEY) {
    // Derive a stable secret from the Gemini API key if no dedicated session secret is provided.
    // This is crucial for serverless environments where a randomly generated secret would not be persistent
    // across different function invocations (e.g., /nonce and /verify), causing session validation to fail.
    console.warn("---");
    console.warn("SECURITY WARNING: `SESSION_SECRET_KEY` is not set. Deriving a session secret from `GEMINI_API_KEY`.");
    console.warn("For optimal security, please set a dedicated, secure `SESSION_SECRET_KEY` environment variable.");
    console.warn("---");
    // Use createHmac to derive a key, which is a sound cryptographic practice (similar to HKDF).
    const salt = 'owfn-siws-session-salt-v2'; // A static salt for this specific purpose
    SESSION_SECRET = createHmac('sha256', process.env.GEMINI_API_KEY).update(salt).digest('hex');
} else {
    // Fallback for local development if no keys are set at all. This is insecure for production.
    console.warn("---");
    console.warn("CRITICAL SECURITY WARNING: Neither `SESSION_SECRET_KEY` nor `GEMINI_API_KEY` are set.");
    console.warn("A temporary, insecure secret is being generated. This is NOT safe for production.");
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
        // CRITICAL FIX: The signature strings are in hexadecimal format.
        // They must be converted to Buffers using 'hex' encoding for a correct and safe comparison.
        const signatureBuffer = Buffer.from(signature, 'hex');
        const expectedSignatureBuffer = Buffer.from(expectedSignature, 'hex');

        // Use timingSafeEqual to prevent timing attacks. It requires buffers of the same length.
        if (signatureBuffer.length !== expectedSignatureBuffer.length) {
            return false;
        }
        
        return timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
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
    // Manually parse the cookie header for robustness in any serverless environment
    const cookies = parse(req.headers.cookie || '');
    const cookie = cookies['auth-session'];
    if (!cookie) return null;

    const signatureIndex = cookie.lastIndexOf('.');
    
    // Check for a valid separator. It can't be the first or last character.
    if (signatureIndex <= 0 || signatureIndex >= cookie.length - 1) {
        return null;
    }

    const sessionStr = cookie.substring(0, signatureIndex);
    const signature = cookie.substring(signatureIndex + 1);

    if (verify(sessionStr, signature)) {
        try {
            return JSON.parse(sessionStr);
        } catch {
            // JSON parsing failed, cookie is malformed.
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