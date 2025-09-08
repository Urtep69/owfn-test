import type { ChatMessage } from '../types.ts';

// Helper function to format chat history into a styled HTML string.
function formatHistoryToHtml(history: ChatMessage[], langCode: string): string {
    const OWFN_LOGO_URL = 'https://www.owfn.org/assets/owfn.png';
    // A self-contained, base64 encoded SVG for the user icon to avoid external requests and ensure compatibility.
    const USER_ICON_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5YWEzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTItMyAxLTEgNCA0LTEgMSAzeiIvPjxwYXRoIGQ9Ik0xMiA1di4wMUE1IDUgMCAwIDAgMTIgMTVhNSA1IDAgMCAwIDAtOS45OVY1eiIvPjwvc3ZnPg==';

    const THEME = {
        dark: {
            bg: '#141311', // darkPrimary-950
            cardBg: '#211F1C', // darkPrimary-900
            text: '#EBE5DB', // darkPrimary-200
            subtleText: '#837C73', // darkPrimary-500
            modelBubble: '#302D29', // darkPrimary-800
            userBubble: '#DDC9A7', // darkAccent-500
            userBubbleText: '#3A3126', // darkAccent-950
            borderColor: '#494540', // darkPrimary-700
            accent: '#E4D5A8', // darkAccent-400
        }
    };
    
    const formatTimestamp = (dateStr?: Date): string => {
        if (!dateStr) return '';
        try {
            return new Date(dateStr).toLocaleString(langCode || 'en-US', {
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return new Date(dateStr).toUTCString();
        }
    };

    const messagesHtml = history.map(msg => {
        const timestamp = formatTimestamp(msg.timestamp);
        const isUser = msg.role === 'user';
        
        const avatarHtml = `
            <img src="${isUser ? USER_ICON_URL : OWFN_LOGO_URL}" alt="${isUser ? 'User' : 'OWFN'}" style="width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;">
        `;

        const messageBubbleHtml = `
            <div style="display: flex; flex-direction: column; align-items: ${isUser ? 'flex-end' : 'flex-start'};">
                <div style="
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 18px;
                    background-color: ${isUser ? THEME.dark.userBubble : THEME.dark.modelBubble};
                    color: ${isUser ? THEME.dark.userBubbleText : THEME.dark.text};
                    border-bottom-left-radius: ${!isUser ? '4px' : '18px'};
                    border-bottom-right-radius: ${isUser ? '4px' : '18px'};
                ">
                    <p style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-size: 14px; line-height: 1.5;">${msg.parts[0].text}</p>
                </div>
                ${timestamp ? `<p style="font-size: 11px; color: ${THEME.dark.subtleText}; margin: 4px 8px 0;">${timestamp}</p>` : ''}
            </div>
        `;

        return `
            <div style="display: flex; justify-content: ${isUser ? 'flex-end' : 'flex-start'}; align-items: flex-start; gap: 12px; margin-bottom: 16px;">
                ${!isUser ? avatarHtml : ''}
                ${messageBubbleHtml}
                ${isUser ? avatarHtml : ''}
            </div>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html lang="${langCode}" style="color-scheme: dark; supported-color-schemes: dark;">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>Your OWFN Chat Transcript</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                    background-color: ${THEME.dark.bg};
                    color: ${THEME.dark.text};
                    margin: 0;
                    padding: 0;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                .container { max-width: 600px; margin: 20px auto; padding: 24px; background-color: ${THEME.dark.cardBg}; border: 1px solid ${THEME.dark.borderColor}; border-radius: 16px; }
                .header { text-align: center; border-bottom: 1px solid ${THEME.dark.borderColor}; padding-bottom: 20px; margin-bottom: 25px; display: flex; align-items: center; justify-content: center; gap: 12px; }
                .header h1 { font-size: 22px; color: ${THEME.dark.text}; margin: 0; }
                .footer { text-align: center; font-size: 12px; color: ${THEME.dark.subtleText}; margin-top: 30px; padding-top: 20px; border-top: 1px solid ${THEME.dark.borderColor}; }
                .footer a { color: ${THEME.dark.accent}; text-decoration: none; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${OWFN_LOGO_URL}" alt="OWFN Logo" style="width: 36px; height: 36px; border-radius: 50%;">
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