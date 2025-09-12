import { GoogleGenAI, Type } from "@google/genai";
import { SUPPORTED_LANGUAGES } from '../lib/constants';

const generateAutoReplySignatureHtml = (languageCode: string = 'en') => {
    const logoUrl = 'https://www.owfn.org/assets/owfn.png';
    const siteUrl = 'https://www.owfn.org/';
    const twitterLink = 'https://x.com/OWFN_Official';
    const telegramLink = 'https://t.me/OWFNOfficial';
    const discordLink = 'https://discord.gg/DzHm5HCqDW';

    // Simple translations for the disclaimer
    const disclaimers: Record<string, string> = {
        'en': 'This is an automated email to confirm receipt of your message. Please be patient, as we receive a high volume of emails. We will respond to you as soon as possible.',
        'ro': 'Acesta este un e-mail generat automat pentru a confirma primirea mesajului dumneavoastră. Vă rugăm să aveți răbdare, volumul de e-mailuri este mare, dar vă vom răspunde în cel mai scurt timp posibil.',
        'de': 'Dies ist eine automatisierte E-Mail, um den Empfang Ihrer Nachricht zu bestätigen. Bitte haben Sie etwas Geduld, da wir ein hohes E-Mail-Aufkommen haben. Wir werden Ihnen so schnell wie möglich antworten.',
        'es': 'Este es un correo electrónico automático para confirmar la recepción de su mensaje. Por favor, tenga paciencia, ya que recibimos un gran volumen de correos electrónicos. Le responderemos lo antes posible.',
    };
    const disclaimerText = disclaimers[languageCode] || disclaimers['en'];

    return `
    <div style="font-family: Arial, sans-serif; color: #333333; max-width: 500px; margin-top: 30px; padding-top: 20px; border-top: 2px solid #b89b74;">
      <table style="width: 100%;" border="0" cellspacing="0" cellpadding="0">
        <tbody>
          <tr>
            <td style="vertical-align: top; padding-right: 20px; width: 80px;">
              <a href="${siteUrl}" rel="noopener" target="_blank">
                <img style="border-radius: 50%; width: 70px; height: 70px;" src="${logoUrl}" alt="OWFN Logo" width="70" />
              </a>
            </td>
            <td style="vertical-align: top; border-left: 1px solid #e0e0e0; padding-left: 20px;">
              <p style="margin: 0; font-size: 16px; font-weight: bold; color: #292524;">Official World Family Network</p>
              <p style="margin: 5px 0 12px 0; font-size: 12px; color: #78716c; font-style: italic;">Uniting humanity for 100% transparent social impact.</p>
              <p style="margin: 0 0 12px 0;">
                <a style="color: #b89b74; text-decoration: none; font-weight: bold; font-size: 13px;" href="${siteUrl}" rel="noopener" target="_blank">www.owfn.org</a>
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
          <tr>
            <td colspan="2" style="padding-top: 20px;">
                <p style="font-family: Arial, sans-serif; font-size: 11px; color: #888888; text-align: center; margin: 0;">
                    ${disclaimerText}
                </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    `;
};


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    
    // FIX: Per coding guidelines, the API key must be sourced from process.env.API_KEY.
    const geminiApiKey = process.env.API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    // FIX: Updated error message to reference the correct environment variable.
    if (!geminiApiKey || !resendApiKey) {
        console.error("CRITICAL: API_KEY or RESEND_API_KEY environment variable is not set.");
        return res.status(500).json({ success: false, error: "Server configuration error." });
    }

    try {
        const { name, email, reason, message } = req.body;

        // Basic validation
        if (!name || !email || !reason || !message || !name.trim() || !email.trim() || !message.trim()) {
            return res.status(400).json({ success: false, error: 'All fields are required.' });
        }
        
        if (!/^\S+@\S+\.\S+$/.test(email)) {
             return res.status(400).json({ success: false, error: 'Invalid email format.' });
        }

        const submissionDate = new Date().toUTCString();
        
        // Enhanced location details from Vercel headers
        const countryCode = req.headers['x-vercel-ip-country'] || 'N/A';
        const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'N/A';
        const senderLocation = [city, countryCode].filter(part => part !== 'N/A').join(', ');
        
        const emailRecipientMap: Record<string, string> = {
            general: 'info@owfn.org',
            partnership: 'partnerships@owfn.org',
            press: 'press@owfn.org',
            support: 'support@owfn.org',
            feedback: 'info@owfn.org',
            other: 'info@owfn.org',
        };
        const reasonTextMap: Record<string, string> = {
            general: 'General Question',
            partnership: 'Partnership Proposal',
            press: 'Press Inquiry',
            support: 'Technical Support',
            feedback: 'Feedback & Suggestions',
            other: 'Other',
        };

        const recipientEmail = emailRecipientMap[reason as string] || 'info@owfn.org';
        const reasonForPrompt = reasonTextMap[reason as string] || 'Other';
        
        // Step 1: Use Gemini to analyze, translate to ROMANIAN, and format the email content for the admin
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        const promptForAdmin = `A user has submitted a contact form on the OWFN (Official World Family Network) website. Your task is to process this information and generate a structured email for an administrator.

First, analyze the user's message provided below to detect its original language.
Then, create a concise summary of the message IN ROMANIAN.
Finally, create a full translation of the message IN ROMANIAN.

Use this analysis to format a professional email subject and a well-structured HTML body.

Submission Details to include:
- Sender Name: ${name}
- Sender Email: ${email}
- Reason for Contact: ${reasonForPrompt}
- Submission Time (UTC): ${submissionDate}
- Sender Location: ${senderLocation}
- Detected Language: [The language you detected]

User's Original Message:
---
${message}
---`;

        const adminEmailSchema = {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING, description: 'A concise email subject line. Start with \'[OWFN Contact]\', followed by the reason for contact and the sender\'s name.' },
                htmlBody: { type: Type.STRING, description: 'The full, formatted body of the email in HTML. It MUST contain: 1. A styled \'Submission Details\' block with all metadata. 2. A section titled \'AI Summary (Romanian)\'. 3. A section titled \'AI Translation (Romanian)\'. 4. A horizontal rule. 5. The \'Original Message\' section.' },
                detectedLanguage: { type: Type.STRING, description: 'The detected language of the user\'s message as a standard name, e.g., "English", "Romanian", "Spanish". Default to "English" if unsure.' }
            },
            propertyOrdering: ["subject", "htmlBody", "detectedLanguage"],
        };
        
        const responseForAdmin = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: promptForAdmin,
            config: {
                responseMimeType: "application/json",
                responseSchema: adminEmailSchema,
            },
        });
        
        let adminEmailContent;
        let detectedLanguage = 'English';
        let detectedLanguageCode = 'en';

        try {
            const jsonStr = responseForAdmin.text.trim();
            const parsedContent = JSON.parse(jsonStr);
            adminEmailContent = parsedContent;
            detectedLanguage = parsedContent.detectedLanguage || 'English';
            
            // ROBUST FIX: Replace unstable Intl.DisplayNames with a safe, internal lookup.
            const lang = SUPPORTED_LANGUAGES.find(l => l.name.toLowerCase() === detectedLanguage.toLowerCase());
            detectedLanguageCode = lang ? lang.code : 'en';

        } catch (e) {
            console.error("Gemini did not return valid JSON for admin email.", e, responseForAdmin.text);
            adminEmailContent = {
                subject: `[OWFN Contact] ${reasonForPrompt} from ${name}`,
                htmlBody: `<p>AI Processing Failed. Original message below.</p><hr><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Reason:</strong> ${reasonForPrompt}</p><p><strong>Location:</strong> ${senderLocation}</p><hr><p style="white-space: pre-wrap;">${message}</p>`
            };
        }

        // Step 2: Send the formatted email to the admin
        const sendAdminEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'OWFN Contact Form <contact@email.owfn.org>',
                to: recipientEmail,
                subject: adminEmailContent.subject,
                html: adminEmailContent.htmlBody,
                reply_to: email
            })
        });

        if (!sendAdminEmailResponse.ok) {
            const errorBody = await sendAdminEmailResponse.json();
            console.error('Resend API error for admin email:', errorBody);
            throw new Error('Failed to send admin email via Resend.');
        }

        // Step 3 (Fire and Forget): Generate and send the auto-reply to the user
        try {
            const departmentName = reasonTextMap[reason as string] || 'our team';

            const promptForUser = `A user named "${name}" contacted the "${departmentName}" department of OWFN. Their original message was in ${detectedLanguage}.

Your task is to generate a longer, more structured, emotional, and engaging automated confirmation email for them IN ${detectedLanguage}.

The email MUST adhere to the following structure and tone:

1.  **Subject Line**: Create a warm and professional subject line in ${detectedLanguage}. For example: "Your message to OWFN has been received!" or "Thank you for contacting the OWFN team!".

2.  **Email Body**:
    *   **Greeting**: Start with a polite and personal greeting to the user by their name, "${name}".
    *   **Confirmation**: Confirm that their message to the "${departmentName}" department has been successfully received. Express excitement that they reached out to this specific department.
    *   **Project Introduction**: Write a short, inspiring paragraph about OWFN's mission. Mention that by contacting us, they are part of a global movement for good.
    *   **Call to Explore**: Encourage them to explore more of the project while they wait for a personal response. You MUST include HTML anchor tags (<a>) for these links. Example: "While you wait, feel free to explore our <a href="https://www.owfn.org/roadmap" style="color: #b89b74; text-decoration: underline;">Roadmap</a> to see our future plans or visit the <a href="https://www.owfn.org/impact" style="color: #b89b74; text-decoration: underline;">Impact Portal</a> to see our mission in action."
    *   **Call to Join**: Invite them to join the OWFN family on social media if they haven't already. You MUST include HTML anchor tags (<a>) for these links. Example: "Stay connected with our global family on <a href="https://x.com/OWFN_Official" style="color: #b89b74; text-decoration: underline;">X/Twitter</a> and <a href="https://t.me/OWFNOfficial" style="color: #b89b74; text-decoration: underline;">Telegram</a> for the latest updates."
    *   **Patience and Closing**: Reiterate that a team member will respond as soon as possible, but response times may vary due to high volume.
    *   **Mandatory Closing Line**: The email MUST end with the exact translated phrase for "Please do not reply to this email, as it is system-generated."

Your entire response should be a JSON object with a "subject" and "body" key, with all text translated into ${detectedLanguage}. The body should be plain text with newlines for paragraphs, and the specified HTML links included.`;


            const userEmailSchema = {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING, description: `A translated subject line in ${detectedLanguage}. Should be similar to "We've received your message | OWFN".` },
                    body: { type: Type.STRING, description: `The complete, translated plain text body of the email in ${detectedLanguage}, including the greeting, all required points, and the specified HTML anchor tags for links.` }
                },
                propertyOrdering: ["subject", "body"],
            };

            const responseForUser = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: promptForUser,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: userEmailSchema,
                }
            });

            let userEmailContent;
            try {
                userEmailContent = JSON.parse(responseForUser.text.trim());
            } catch (e) {
                console.error("Gemini failed to generate valid JSON for user auto-reply:", e, responseForUser.text);
                throw new Error("Failed to parse Gemini response for user email.");
            }

            if (userEmailContent.subject && userEmailContent.body) {
                const textBodyWithLineBreaks = `<p>${userEmailContent.body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
                const signature = generateAutoReplySignatureHtml(detectedLanguageCode);
                const finalHtmlBody = `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6;">${textBodyWithLineBreaks}${signature}</div>`;

                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
                    body: JSON.stringify({
                        from: 'Official World Family Network <no-reply@email.owfn.org>',
                        to: email,
                        subject: userEmailContent.subject,
                        html: finalHtmlBody,
                    })
                });
            }
        } catch (autoReplyError) {
            console.error('Failed to send auto-reply to user:', autoReplyError);
            // We do not re-throw this error. The primary function of sending the admin email was successful.
            // This is a non-critical enhancement for the user.
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully.' });

    } catch (error) {
        console.error('Contact form API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while processing your message.' });
    }
}