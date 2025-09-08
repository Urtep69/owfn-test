import type { ChatMessage } from '../types.ts';

// Helper function to format chat history into a styled HTML string.
function formatHistoryToHtml(history: ChatMessage[], langCode: string): string {
    const formatTimestamp = (dateStr?: Date): string => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleString(langCode || 'en-US', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        } catch (e) {
            return new Date(dateStr).toUTCString(); // Fallback
        }
    };

    const messagesHtml = history.map(msg => {
        const timestamp = formatTimestamp(msg.timestamp);
        const isUser = msg.role === 'user';
        const alignment = isUser ? 'right' : 'left';
        
        const bubbleStyle = `
            display: inline-block;
            max-width: 75%;
            padding: 10px 14px;
            border-radius: 18px;
            text-align: left;
            margin-bottom: 2px;
        `;
        
        const userStyle = `
            background-color: #fcd34d; /* accent-300 */
            color: #451a03; /* accent-950 */
            border-bottom-right-radius: 4px;
        `;

        const modelStyle = `
            background-color: #f3f4f6; /* primary-100 */
            color: #1f2937; /* primary-800 */
            border-bottom-left-radius: 4px;
        `;

        const timestampStyle = `
            font-size: 10px;
            color: #6b7280;
            margin-top: 4px;
        `;

        return `
            <div style="text-align: ${alignment}; margin-bottom: 12px;">
                <div style="${bubbleStyle} ${isUser ? userStyle : modelStyle}">
                    <p style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${msg.parts[0].text}</p>
                </div>
                ${timestamp ? `<p style="${timestampStyle}">${timestamp}</p>` : ''}
            </div>
        `;
    }).join('');

    // Full HTML document structure for better email client compatibility.
    return `
        <!DOCTYPE html>
        <html lang="${langCode}">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your OWFN Chat Transcript</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; background-color: #f9fafb; color: #374151; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; }
                .header { text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 25px; }
                .header h1 { font-size: 24px; color: #111827; margin: 0; }
                .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
                .footer a { color: #b45309; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your OWFN Chat Transcript</h1>
                </div>
                <div>
                    ${messagesHtml}
                </div>
                <div class="footer">
                    <p>This transcript was automatically sent from the Official World Family Network (OWFN) website.</p>
                    <p><a href="https://www.owfn.org/">Visit owfn.org</a></p>
                </div>
            </div>
        </body>
        </html>
    `;
}


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
        const { history, email, langCode } = req.body;

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, error: 'Invalid email address provided.' });
        }
        if (!Array.isArray(history) || history.length === 0) {
            return res.status(400).json({ success: false, error: 'Chat history is empty or invalid.' });
        }

        const htmlBody = formatHistoryToHtml(history, langCode);

        const sendEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'OWFN Assistant <transcript@email.owfn.org>',
                to: email,
                subject: 'Your OWFN Chat Transcript',
                html: htmlBody,
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
        return res.status(500).json({ success: false, error: 'An error occurred while sending the transcript.' });
    }
}