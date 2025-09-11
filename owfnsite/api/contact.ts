import { GoogleGenAI, Type } from "@google/genai";

const generateAutoReplySignatureHtml = () => {
    const logoUrl = 'https://www.owfn.org/assets/owfn.png';
    const twitterLink = 'https://x.com/OWFN_Official';
    const telegramLink = 'https://t.me/OWFNOfficial';
    const discordLink = 'https://discord.gg/DzHm5HCqDW';

    return `
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #dddddd; margin-top: 25px; padding-top: 20px;">
            <tr>
                <td style="padding-bottom: 20px;">
                    <table border="0" cellspacing="0" cellpadding="0">
                        <tr>
                            <td align="left" valign="top" style="padding-right: 15px;">
                                <img src="${logoUrl}" alt="OWFN Logo" width="60" style="width: 60px; border-radius: 50%;">
                            </td>
                            <td align="left" valign="middle" style="font-family: Arial, sans-serif;">
                                <p style="margin: 0; font-size: 14px; color: #333333; font-weight: bold;">Official World Family Network (OWFN)</p>
                                <p style="margin: 5px 0 0; font-size: 12px; color: #777777;">
                                    <a href="${twitterLink}" style="color: #777777; text-decoration: none; margin-right: 10px;">X/Twitter</a> |
                                    <a href="${telegramLink}" style="color: #777777; text-decoration: none; margin: 0 10px;">Telegram</a> |
                                    <a href="${discordLink}" style="color: #777777; text-decoration: none; margin-left: 10px;">Discord</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding-top: 15px; border-top: 1px solid #eeeeee;">
                    <p style="font-family: Arial, sans-serif; font-size: 11px; color: #888888; text-align: center; margin: 0;">
                        This is an automated email to confirm receipt of your message. Please be patient, as we receive a high volume of emails. We will respond to you as soon as possible.
                    </p>
                </td>
            </tr>
        </table>
    `;
};


export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!geminiApiKey || !resendApiKey) {
        console.error("CRITICAL: GEMINI_API_KEY or RESEND_API_KEY environment variable is not set.");
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
        
        let countryName = 'N/A';
        if (countryCode !== 'N/A') {
            try {
                countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
            } catch (e) {
                console.warn(`Could not get country name for code: ${countryCode}`);
                countryName = countryCode;
            }
        }
        
        const senderLocation = [city, countryName].filter(part => part !== 'N/A').join(', ');
        
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

        try {
            const jsonStr = responseForAdmin.text.trim();
            const parsedContent = JSON.parse(jsonStr);
            adminEmailContent = parsedContent;
            detectedLanguage = parsedContent.detectedLanguage || 'English';
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
                from: 'Contact Form OWFN <contact@email.owfn.org>',
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
Your task is to generate a polite, automated confirmation email for them IN ${detectedLanguage}.
The email must include the following points:
1. A polite greeting to the user by their name, "${name}".
2. Confirmation that their message to the "${departmentName}" department has been received.
3. An explanation that this is an automated response and a team member will reply as soon as possible.
4. A statement that response times may vary due to a high volume of inquiries.
5. The mandatory closing phrase: "Please do not reply to this email, as it is system-generated." or its direct translation in ${detectedLanguage}.

Generate a suitable, translated subject line and the plain text body for this email.`;

            const userEmailSchema = {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING, description: `A translated subject line in ${detectedLanguage}. Should be similar to "We've received your message | OWFN".` },
                    body: { type: Type.STRING, description: `The complete, translated plain text body of the email in ${detectedLanguage}, including the greeting and all required points.` }
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
                const signature = generateAutoReplySignatureHtml();
                const finalHtmlBody = `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6;">${textBodyWithLineBreaks}${signature}</div>`;

                await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
                    body: JSON.stringify({
                        from: 'OWFN Auto-Reply <no-reply@email.owfn.org>',
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
