import type { ChatMessage } from '../types.ts';

const introductoryMessages: Record<string, { subject: string, body: string }> = {
    'en': {
        subject: `Your OWFN Chat Conversation Transcript`,
        body: `Hello!<br><br>Thank you for connecting with the OWFN AI Assistant. We hope your conversation was helpful and brought you closer to our mission. Below is a complete copy of your discussion for your records.<br><br>You are a valued part of our global family, a movement built on empathy, solidarity, and the desire to bring real help to those in need. While you're here, we warmly invite you to explore our <a href="https://www.owfn.org/" style="color: #b89b74; text-decoration: underline;">website</a> to see our vision in more detail, or join the conversation on our official social channels to stay connected with the latest updates and our community.<br><br>Together, we are building a better future.`
    },
    'ro': {
        subject: `Transcriere a Conversației Dvs. cu Asistentul OWFN`,
        body: `Salut!<br><br>Îți mulțumim pentru că ai interacționat cu Asistentul AI al OWFN. Sperăm că conversația a fost de ajutor și te-a adus mai aproape de misiunea noastră. Mai jos găsești o copie completă a discuției tale.<br><br>Ești o parte valoroasă a familiei noastre globale, o mișcare construită pe empatie, solidaritate și dorința de a aduce ajutor real celor în nevoie. Cât ești aici, te invităm cu drag să explorezi <a href="https://www.owfn.org/" style="color: #b89b74; text-decoration: underline;">site-ul nostru</a> pentru a vedea viziunea noastră în detaliu, sau să te alături conversației pe canalele noastre sociale oficiale pentru a rămâne conectat cu ultimele noutăți și cu comunitatea noastră.<br><br>Împreună, construim un viitor mai bun.`
    },
    // Add more languages as needed
};

const generateSignatureHtml = () => {
    const logoUrl = 'https://www.owfn.org/assets/owfn.png';
    const siteUrl = 'https://www.owfn.org/';
    const twitterLink = 'https://x.com/OWFN_Official';
    const telegramLink = 'https://t.me/OWFNOfficial';
    const discordLink = 'https://discord.gg/DzHm5HCqDW';

    return `
    <table style="width: 100%; max-width: 500px; margin: 30px auto 0 auto; padding-top: 20px; border-top: 1px solid #444;" border="0" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <td style="vertical-align: top; padding-right: 20px; width: 80px;">
              <a href="${siteUrl}" rel="noopener" target="_blank">
                <img style="border-radius: 50%; width: 70px; height: 70px;" src="${logoUrl}" alt="OWFN Logo" width="70" />
              </a>
            </td>
            <td style="vertical-align: top; border-left: 1px solid #444; padding-left: 20px;">
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #e7e5e4;">Official World Family Network</p>
              <p style="margin: 5px 0 12px 0; font-family: Arial, sans-serif; font-size: 12px; color: #a8a29e; font-style: italic;">Uniting humanity for 100% transparent social impact.</p>
              <p style="margin: 0 0 12px 0;">
                <a style="font-family: Arial, sans-serif; color: #b89b74; text-decoration: none; font-weight: bold; font-size: 13px;" href="${siteUrl}" rel="noopener" target="_blank">www.owfn.org</a>
              </p>
              <div>
                <a style="display: inline-block; margin-right: 10px;" href="${twitterLink}" rel="noopener" target="_blank">
                  <img src="https://img.icons8.com/ios-glyphs/30/a8a29e/twitterx.png" alt="X.com" width="24" style="width: 24px; height: 24px;" />
                </a>
                <a style="display: inline-block; margin-right: 10px;" href="${telegramLink}" rel="noopener" target="_blank">
                  <img src="https://img.icons8.com/ios-glyphs/30/a8a29e/telegram-app.png" alt="Telegram" width="24" style="width: 24px; height: 24px;" />
                </a>
                <a style="display: inline-block;" href="${discordLink}" rel="noopener" target="_blank">
                  <img src="https://img.icons8.com/ios-glyphs/30/a8a29e/discord-logo.png" alt="Discord" width="24" style="width: 24px; height: 24px;" />
                </a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    `;
};


const generateChatTranscriptHtml = (messages: ChatMessage[], langCode: string) => {
    let html = '';
    const timestampOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    };

    for (const msg of messages) {
        if (!msg.timestamp || !msg.parts?.[0]?.text) continue;

        const date = new Date(msg.timestamp);
        const formattedTimestamp = date.toLocaleString(langCode, timestampOptions);
        
        // Timestamp Row
        html += `
            <tr>
                <td colspan="3" style="text-align: center; padding-top: 10px; padding-bottom: 5px;">
                    <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #a1a1aa;">${formattedTimestamp}</p>
                </td>
            </tr>
        `;

        const textContent = msg.parts[0].text.replace(/\n/g, '<br />');

        // Message Row
        if (msg.role === 'model') {
            html += `
                <tr>
                    <td style="padding: 5px; vertical-align: bottom; width: 40px;">
                        <img src="https://www.owfn.org/assets/owfn.png" alt="OWFN" width="32" style="border-radius: 50%; width: 32px; height: 32px;" />
                    </td>
                    <td style="padding: 5px; text-align: left;">
                        <div style="background-color: #404040; color: #f5f5f4; font-family: Arial, sans-serif; font-size: 14px; padding: 10px 15px; border-radius: 12px; display: inline-block; max-width: 90%;">
                            ${textContent}
                        </div>
                    </td>
                    <td style="width: 40px;"></td>
                </tr>
            `;
        } else { // user
            html += `
                <tr>
                    <td style="width: 40px;"></td>
                    <td style="padding: 5px; text-align: right;">
                        <div style="background-color: #b89b74; color: #1c1917; font-family: Arial, sans-serif; font-size: 14px; padding: 10px 15px; border-radius: 12px; display: inline-block; max-width: 90%;">
                           ${textContent}
                        </div>
                    </td>
                    <td style="padding: 5px; vertical-align: bottom; width: 40px; text-align: center;">
                        <img src="https://img.icons8.com/material-sharp/48/b89b74/user-male-circle.png" alt="User" width="32" style="width: 32px; height: 32px;"/>
                    </td>
                </tr>
            `;
        }
    }
    return html;
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
        const { recipientEmail, messages, langCode = 'en' } = req.body;

        if (!recipientEmail || !/^\S+@\S+\.\S+$/.test(recipientEmail)) {
            return res.status(400).json({ success: false, error: 'A valid recipient email is required.' });
        }

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, error: 'A conversation transcript is required.' });
        }
        
        const introContent = introductoryMessages[langCode] || introductoryMessages['en'];
        const transcriptHtml = generateChatTranscriptHtml(messages, langCode);
        const signatureHtml = generateSignatureHtml();
        
        const finalHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${introContent.subject}</title>
            </head>
            <body style="margin: 0; padding: 20px; background-color: #18181b; font-family: Arial, sans-serif;">
                <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #18181b;" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                        <td style="padding: 20px 20px 0 20px;">
                            <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 25px;">
                                ${introContent.body}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; background-color: #27272a; border-radius: 8px;">
                            <table style="width: 100%;" border="0" cellspacing="0" cellpadding="0">
                                ${transcriptHtml}
                            </table>
                        </td>
                    </tr>
                    <tr>
                         <td style="padding: 0 20px;">
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
                subject: introContent.subject,
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