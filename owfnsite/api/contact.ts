
import { GoogleGenAI, Type } from "@google/genai";
import { translations } from '../lib/locales/index.ts';
import { SUPPORTED_LANGUAGES } from '../constants.ts';

const sendAutoReply = async (apiKey: string, userName: string, userEmail: string, reason: string, message: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey });

        // 1. Detect language
        const langDetectionPrompt = `Detect the ISO 639-1 language code of the following text. Respond with ONLY the two-letter code (e.g., 'en', 'ro'). Do not add any other text or explanation. Text:\n---\n${message}`;
        
        const langDetectionResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: langDetectionPrompt,
            config: {
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
            }
        });

        const detectedLangCode = langDetectionResponse.text.trim().toLowerCase();
        const supportedLangCodes = SUPPORTED_LANGUAGES.map(l => l.code);
        const lang = supportedLangCodes.includes(detectedLangCode) ? detectedLangCode : 'en';

        // 2. Prepare translated content
        const departmentKey = `contact_reason_${reason}`;
        const departmentName = translations[lang]?.[departmentKey] || translations['en']?.[departmentKey] || reason;

        const subjectTemplate = translations[lang]?.auto_reply_subject || translations['en']?.auto_reply_subject;
        const bodyTemplate = translations[lang]?.auto_reply_body || translations['en']?.auto_reply_body;

        const autoReplySubject = subjectTemplate.replace('{departmentName}', departmentName);
        
        // Replace both placeholders in the body
        let autoReplyBody = bodyTemplate.replace('{userName}', userName);
        autoReplyBody = autoReplyBody.replace('{departmentName}', departmentName);

        // 3. Send email to user
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'OWFN Auto-Reply <no-reply@email.owfn.org>',
                to: userEmail,
                subject: autoReplySubject,
                html: autoReplyBody,
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Auto-reply Resend API error:', errorBody);
        } else {
             console.log(`Auto-reply successfully sent to ${userEmail} in language: ${lang}`);
        }

    } catch (error) {
        console.error('Failed to send auto-reply email:', error);
        // Do not throw, as the main function should still return success to the user.
    }
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
        const region = req.headers['x-vercel-ip-country-region'] || 'N/A';
        
        let countryName = 'N/A';
        if (countryCode !== 'N/A') {
            try {
                // Get the full country name in English from the country code
                countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
            } catch (e) {
                console.warn(`Could not get country name for code: ${countryCode}`);
                countryName = countryCode;
            }
        }
        
        const locationParts = [
            countryCode !== 'N/A' ? countryCode : null,
            city !== 'N/A' ? city : null,
            countryName !== 'N/A' && countryName !== countryCode ? countryName : null,
        ].filter(Boolean); // Filter out null values
        
        const senderLocation = locationParts.length > 0 ? locationParts.join(', ') : 'N/A';
        
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
        
        const adminPrompt = `A user has submitted a contact form on the OWFN (Official World Family Network) website. Your task is to process this information and generate a structured email for an administrator.

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

        const subjectDescription = [
            'A concise email subject line. Start with \'[OWFN Contact]\'',
            'followed by the reason for contact and the sender\'s name.'
        ].join(' ');

        const htmlBodyDescription = [
            'The full, formatted body of the email in HTML.',
            'It MUST contain the following sections in this exact order:',
            '1. A styled \'Submission Details\' block with all provided metadata including the detected language.',
            '2. A section titled \'AI Summary (Romanian)\' with your concise summary.',
            '3. A section titled \'AI Translation (Romanian)\' with your full translation.',
            '4. A horizontal rule (<hr>).',
            '5. The \'Original Message\' section with the user\'s verbatim message.'
        ].join(' ');

        const adminEmailResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: adminPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: {
                            type: Type.STRING,
                            description: subjectDescription
                        },
                        htmlBody: {
                            type: Type.STRING,
                            description: htmlBodyDescription
                        }
                    },
                    propertyOrdering: ["subject", "htmlBody"],
                },
            },
        });
        
        let adminEmailContent;
        try {
            const jsonStr = adminEmailResponse.text.trim();
            adminEmailContent = JSON.parse(jsonStr);
        } catch(e) {
            console.error("Gemini did not return valid JSON for admin email.", e);
            console.error("Gemini response text:", adminEmailResponse.text);
            // Fallback to a simple email if AI processing fails
            adminEmailContent = {
                subject: `[OWFN Contact] ${reasonForPrompt} from ${name}`,
                htmlBody: `
                    <h1>New Contact Form Submission (AI Processing Failed)</h1>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Reason:</strong> ${reasonForPrompt}</p>
                    <p><strong>Submission Time (UTC):</strong> ${submissionDate}</p>
                    <p><strong>Sender Location:</strong> ${senderLocation}</p>
                    <hr>
                    <h2>Original Message</h2>
                    <p style="white-space: pre-wrap;">${message}</p>
                `
            };
        }

        // Step 2: Send the formatted email to the admin using Resend
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
            console.error('Admin email Resend API error:', errorBody);
            throw new Error('Failed to send admin email via Resend.');
        }

        // Step 3: Send the auto-reply to the user (fire and forget)
        // We do this after the main action is successful. We don't want an auto-reply failure to cause the user to see an error.
        sendAutoReply(geminiApiKey, name, email, reason, message);

        return res.status(200).json({ success: true, message: 'Message sent successfully.' });

    } catch (error) {
        console.error('Contact form API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while processing your message.' });
    }
}
