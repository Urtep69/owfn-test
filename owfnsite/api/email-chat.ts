import type { ChatMessage } from '../types.ts';

const generateSignatureHtml = () => {
    const logoUrl = 'https://www.owfn.org/assets/owfn.png';
    const siteUrl = 'https://www.owfn.org/';
    const twitterLink = 'https://x.com/OWFN_Official';
    const telegramLink = 'https://t.me/OWFNOfficial';
    const discordLink = 'https://discord.gg/DzHm5HCqDW';

    return `
    <table style="width: 100%; max-width: 500px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #b89b74;" border="0" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <td style="vertical-align: top; padding-right: 20px; width: 80px;">
              <a href="${siteUrl}" rel="noopener" target="_blank">
                <img style="border-radius: 50%; width: 70px; height: 70px;" src="${logoUrl}" alt="OWFN Logo" width="70" />
              </a>
            </td>
            <td style="vertical-align: top; border-left: 1px solid #e0e0e0; padding-left: 20px;">
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #292524;">Official World Family Network</p>
              <p style="margin: 5px 0 12px 0; font-family: Arial, sans-serif; font-size: 12px; color: #78716c; font-style: italic;">Uniting humanity for 100% transparent social impact.</p>
              <p style="margin: 0 0 12px 0;">
                <a style="font-family: Arial, sans-serif; color: #b89b74; text-decoration: none; font-weight: bold; font-size: 13px;" href="${siteUrl}" rel="noopener" target="_blank">www.owfn.org</a>
              </p>
              <div>
                <a style="display: inline-block; margin-right: 10px;" href="${twitterLink}" rel="noopener" target="_blank">
                  <img src="https://img.icons8.com/ios-glyphs/30/78716c/twitterx.png" alt="X.com" width="24" style="width: 24px; height: 24px;" />
                </a>
                <a style="display: inline-block; margin-right: 10px;" href="${telegramLink}" rel="noopener" target="_blank">
                  <img src="https://img.icons8.com/ios-glyphs/30/78716c/telegram-app.png" alt="Telegram" width="24" style="width: 24px; height: 24px;" />
                </a>
                <a style="display: inline-block;" href="${discordLink}" rel="noopener" target="_blank">
                  <img src="https://img.icons8.com/ios-glyphs/30/78716c/discord-logo.png" alt="Discord" width="24" style="width: 24px; height: 24px;" />
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;
};


const generateChatTranscriptHtml = (messages: ChatMessage[]) => {
    return messages.map(msg => {
        const textContent = msg.parts[0]?.text.replace(/\n/g, '<br />');
        if (msg.role === 'model') {
            return `
                <tr>
                    <td style="padding: 5px; vertical-align: top; width: 40px;">
                        <img src="https://www.owfn.org/assets/owfn.png" alt="OWFN" width="32" style="border-radius: 50%; width: 32px; height: 32px;" />
                    </td>
                    <td style="padding: 5px; text-align: left;">
                        <div style="background-color: #f1f5f9; color: #1e293b; padding: 10px 15px; border-radius: 12px 12px 12px 0; display: inline-block; max-width: 80%;">
                            ${textContent}
                        </div>
                    </td>
                    <td style="width: 40px;"></td>
                </tr>
            `;
        } else { // user
            return `
                <tr>
                    <td style="width: 40px;"></td>
                    <td style="padding: 5px; text-align: right;">
                        <div style="background-color: #fde68a; color: #451a03; padding: 10px 15px; border-radius: 12px 12px 0 12px; display: inline-block; max-width: 80%;">
                           ${textContent}
                        </div>
                    </td>
                    <td style="padding: 5px; vertical-align: top; width: 40px; text-align: center;">
                       <img src="https://img.icons8.com/material-rounded/48/78716c/user.png" alt="User" width="32" style="border-radius: 50%; width: 32px; height: 32px;"/>
                    </td>
                </tr>
            `;
        }
    }).join('');
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
        console.error("CRITICAL: RESEND_API_KEY is not set.");
        return res.status(500).json({ success: false, error: "Server configuration error." });
    }

    try {
        const { recipientEmail, messages } = req.body;

        if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
            return res.status(400).json({ success: false, error: 'A valid recipient email is required.' });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, error: 'A conversation transcript is required.' });
        }

        const transcriptHtml = generateChatTranscriptHtml(messages);
        const signatureHtml = generateSignatureHtml();
        
        const finalHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; color: #333333; line-height: 1.6; }
                </style>
            </head>
            <body style="margin: 0; padding: 20px; background-color: #f9fafb;">
                <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px;" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td>
                            <p style="font-size: 14px; color: #555555; margin-bottom: 20px;">
                                Hello! Here is a copy of your recent conversation with our AI assistant. We hope it was helpful! Remember, you are a valued part of our movement. We invite you to stay connected with our global family on our social channels to get the latest updates.
                            </p>
                            <table style="width: 100%; border-spacing: 0 10px;" border="0" cellspacing="0" cellpadding="0">
                                ${transcriptHtml}
                            </table>
                            ${signatureHtml}
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const sendEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'Official World Family Network <owfnchat@email.owfn.org>',
                to: recipientEmail,
                subject: 'Your OWFN Chat Conversation Transcript',
                html: finalHtml,
            })
        });

        if (!sendEmailResponse.ok) {
            const errorBody = await sendEmailResponse.json();
            console.error('Resend API error:', errorBody);
            throw new Error('Failed to send email via Resend.');
        }

        return res.status(200).json({ success: true, message: 'Email sent successfully.' });

    } catch (error) {
        console.error('Email-chat API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while sending the email.' });
    }
}
