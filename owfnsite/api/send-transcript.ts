// This is a new file: api/send-transcript.ts
import type { ChatMessage } from '../types.ts';

// Helper to sanitize HTML content
const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

// Helper to format a single message into an HTML row
const formatMessageToHtml = (msg: ChatMessage): string => {
    const isUser = msg.role === 'user';
    const align = isUser ? 'right' : 'left';
    const bgColor = isUser ? '#fcd34d' : '#f4f4f5'; // accent-300, primary-100
    const textColor = isUser ? '#451a03' : '#18181b'; // accent-950, primary-900
    const borderRadius = isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px';
    const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';

    const iconHtml = isUser
        ? `<div style="width: 32px; height: 32px; border-radius: 50%; background-color: #fbbf24; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 12px;"><span style="font-size: 16px; color: #451a03;">👤</span></div>`
        : `<img src="https://www.owfn.org/assets/owfn.png" alt="OWFN" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 12px; flex-shrink: 0;" />`;

    // A more robust regex to handle various action/link formats
    const linkRegex = /\[(?:Visit Page|Social Link|Action: Navigate): (.*?)(?:\|(.*?))?\]/g;
    const messageText = escapeHtml(msg.parts[0].text).replace(linkRegex, (match, part1, part2) => {
        // Part 2 usually contains the URL or path
        const url = part2 || `https://www.owfn.org/${part1.toLowerCase()}`;
        return `<a href="${url}" target="_blank" style="color: #b45309; font-weight: bold; text-decoration: underline;">${escapeHtml(part1)}</a>`;
    });

    const messageHtml = `
        <div style="text-align: ${align}; margin-bottom: 4px;">
            <span style="font-size: 11px; color: #71717a;">${timestamp}</span>
        </div>
        <div style="display: flex; justify-content: ${isUser ? 'flex-end' : 'flex-start'};">
            ${!isUser ? iconHtml : ''}
            <div style="background-color: ${bgColor}; color: ${textColor}; padding: 12px 16px; border-radius: ${borderRadius}; max-width: 80%; line-height: 1.5;">
                <p style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${messageText}</p>
            </div>
            ${isUser ? iconHtml : ''}
        </div>
    `;

    return `<div style="margin-bottom: 24px;">${messageHtml}</div>`;
};

const getTranslatedFooter = (langCode: string, email: string): string => {
    const translations: Record<string, { line1: string, line2: string, line3: string, line4: string }> = {
        'ro': { line1: `Transcriere Conversație pentru:`, line2: `Aceasta este o transcriere generată automat.`, line3: `Vă mulțumim că folosiți Asistentul AI OWFN.`, line4: `Vizitați-ne la` },
        'de': { line1: `Gesprächsprotokoll für:`, line2: `Dies ist ein automatisch generiertes Protokoll.`, line3: `Vielen Dank, dass Sie den OWFN AI Assistant verwenden.`, line4: `Besuchen Sie uns unter` },
        'es': { line1: `Transcripción de la Conversación para:`, line2: `Esta es una transcripción generada automáticamente.`, line3: `Gracias por usar el Asistente de IA de OWFN.`, line4: `Visítenos en` },
        // ... add all other languages from your app
        'en': { line1: `Conversation Transcript for:`, line2: `This is an auto-generated transcript.`, line3: `Thank you for using the OWFN AI Assistant.`, line4: `Visit us at` },
    };
    const t = translations[langCode] || translations['en'];

    return `
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
            <p style="color: #a1a1aa; font-size: 12px; margin: 0;">${t.line1} <strong>${email}</strong></p>
            <p style="color: #a1a1aa; font-size: 12px; margin: 4px 0 0 0;">${t.line2} ${t.line3}</p>
            <p style="color: #a1a1aa; font-size: 12px; margin: 4px 0 0 0;">${t.line4} <a href="https://www.owfn.org" style="color: #b45309; text-decoration: none;">owfn.org</a></p>
        </div>
    `;
};


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        console.error("CRITICAL: RESEND_API_KEY environment variable is not set.");
        return res.status(500).json({ success: false, error: "Server configuration error." });
    }

    try {
        const { history, toEmail, langCode } = req.body;

        if (!Array.isArray(history) || history.length === 0) {
            return res.status(400).json({ success: false, error: 'Chat history is empty or invalid.' });
        }
        if (!toEmail || typeof toEmail !== 'string' || !/^\S+@\S+\.\S+$/.test(toEmail)) {
             return res.status(400).json({ success: false, error: 'Invalid email address provided.' });
        }

        const chatHtml = history.map(formatMessageToHtml).join('');
        const footerHtml = getTranslatedFooter(langCode || 'en', toEmail);

        const fullHtmlBody = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OWFN Chat Transcript</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #0c0a09; color: #e7e5e4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 32px; }
                    .header { text-align: center; margin-bottom: 32px; }
                    .header img { width: 64px; height: 64px; }
                    .header h1 { color: #f0d090; margin: 12px 0 0; font-size: 24px; }
                    .chat-box { background-color: #1c1917; border: 1px solid #44403c; border-radius: 12px; padding: 24px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="https://www.owfn.org/assets/owfn.png" alt="OWFN Logo">
                        <h1>OWFN Chat Transcript</h1>
                    </div>
                    <div class="chat-box">
                        ${chatHtml}
                    </div>
                    ${footerHtml}
                </div>
            </body>
            </html>
        `;

        const subject = `Your OWFN AI Assistant Chat Transcript (${new Date().toLocaleDateString()})`;

        const sendEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'OWFN AI Assistant <transcript@email.owfn.org>',
                to: toEmail,
                subject: subject,
                html: fullHtmlBody,
            })
        });

        if (!sendEmailResponse.ok) {
            const errorBody = await sendEmailResponse.json();
            console.error('Resend API error:', errorBody);
            throw new Error('Failed to send email via Resend.');
        }

        return res.status(200).json({ success: true, message: 'Transcript sent successfully.' });

    } catch (error) {
        console.error('Send transcript API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while processing your request.' });
    }
}
