import { GoogleGenAI, Type } from "@google/genai";

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
        const country = req.headers['x-vercel-ip-country'] || 'N/A';
        
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
        
        // Step 1: Use Gemini to analyze, translate, and format the email content
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        const prompt = `A user has submitted a contact form on the OWFN (Official World Family Network) website. Your task is to process this information and generate a structured email for an administrator.

First, analyze the user's message provided below to detect its original language.
Then, create a concise summary of the message IN ENGLISH.
Finally, create a full translation of the message IN ENGLISH.

Use this analysis to format a professional email subject and a well-structured HTML body.

Submission Details to include:
- Sender Name: ${name}
- Sender Email: ${email}
- Reason for Contact: ${reasonForPrompt}
- Submission Time (UTC): ${submissionDate}
- Sender Country: ${country}
- Detected Language: [The language you detected]

User's Original Message:
---
${message}
---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        subject: {
                            type: Type.STRING,
                            description: "A concise email subject line. Start with '[OWFN Contact]' followed by the reason for contact and the sender's name."
                        },
                        htmlBody: {
                            type: Type.STRING,
                            description: "The full, formatted body of the email in HTML. It MUST contain the following sections in this exact order: 1. A styled 'Submission Details' block with all provided metadata including the detected language. 2. A section titled 'AI Summary (English)' with your concise summary. 3. A section titled 'AI Translation (English)' with your full translation. 4. A horizontal rule (<hr>). 5. The 'Original Message' section with the user's verbatim message."
                        }
                    },
                    propertyOrdering: ["subject", "htmlBody"],
                },
            },
        });
        
        let emailContent;
        try {
            const jsonStr = response.text.trim();
            emailContent = JSON.parse(jsonStr);
        } catch(e) {
            console.error("Gemini did not return valid JSON.", e);
            console.error("Gemini response text:", response.text);
            // Fallback to a simple email if AI processing fails
            emailContent = {
                subject: `[OWFN Contact] ${reasonForPrompt} from ${name}`,
                htmlBody: `
                    <h1>New Contact Form Submission (AI Processing Failed)</h1>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Reason:</strong> ${reasonForPrompt}</p>
                    <p><strong>Submission Time (UTC):</strong> ${submissionDate}</p>
                    <p><strong>Sender Country:</strong> ${country}</p>
                    <hr>
                    <h2>Original Message</h2>
                    <p style="white-space: pre-wrap;">${message}</p>
                `
            };
        }

        // Step 2: Send the formatted email using Resend
        const sendEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                from: 'Contact Form OWFN <contact@email.owfn.org>',
                to: recipientEmail,
                subject: emailContent.subject,
                html: emailContent.htmlBody,
                reply_to: email
            })
        });

        if (!sendEmailResponse.ok) {
            const errorBody = await sendEmailResponse.json();
            console.error('Resend API error:', errorBody);
            throw new Error('Failed to send email via Resend.');
        }

        return res.status(200).json({ success: true, message: 'Message sent successfully.' });

    } catch (error) {
        console.error('Contact form API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while processing your message.' });
    }
}
