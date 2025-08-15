import { GoogleGenAI, Type } from "@google/genai";

export const runtime = 'edge'; // Vercel Edge runtime

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    const geminiApiKey = process.env.API_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!geminiApiKey || !resendApiKey) {
        console.error("CRITICAL: API_KEY or RESEND_API_KEY environment variable is not set.");
        return new Response(JSON.stringify({ success: false, error: "Server configuration error." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { name, email, reason, message } = await request.json();

        // Basic validation
        if (!name || !email || !reason || !message || !name.trim() || !email.trim() || !message.trim()) {
            return new Response(JSON.stringify({ success: false, error: 'All fields are required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (!/^\S+@\S+\.\S+$/.test(email)) {
             return new Response(JSON.stringify({ success: false, error: 'Invalid email format.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // --- New data capture ---
        const submissionDate = new Date().toUTCString();
        const country = request.headers.get('x-vercel-ip-country') || 'N/A';
        
        // Map reason key to recipient email and English text for the prompt
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
        
        // Step 1: Use Gemini to format the email content with the new data
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        const prompt = `A user has submitted a contact form on the OWFN (Official World Family Network) website. Please format this information into a professional email subject and a clean, well-structured HTML body.
        
CRITICAL INSTRUCTION: The HTML body MUST start with a styled summary section containing all the submission details provided below. After the summary, add a horizontal rule (<hr>), followed by the user's original message.

Submission Details:
- Sender Name: ${name}
- Sender Email: ${email}
- Reason for Contact: ${reasonForPrompt}
- Submission Time (UTC): ${submissionDate}
- Sender Country: ${country}

Original Message:
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
                            description: "A concise email subject line. Start with '[OWFN Contact]' followed by the reason for contact."
                        },
                        htmlBody: {
                            type: Type.STRING,
                            description: "The full, formatted body of the email in HTML. It MUST begin with a styled summary block containing all details (sender's name, email, reason, submission time, and country). This block should be followed by a horizontal rule (<hr>) and then the original, unmodified message from the user."
                        }
                    },
                    propertyOrdering: ["subject", "htmlBody"],
                },
            },
        });
        
        const jsonStr = response.text.trim();
        const emailContent = JSON.parse(jsonStr);

        // Step 2: Send the formatted email using Resend
        const sendEmailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${resendApiKey}`
            },
            body: JSON.stringify({
                // NOTE: For production, you must verify a domain with Resend (e.g., 'owfn.org') 
                // and send from an address like 'Contact Form <noreply@owfn.org>'.
                // 'onboarding@resend.dev' is for development/testing purposes.
                from: 'Contact Form OWFN <contact@owfn.org>',
                to: recipientEmail, // The project's contact email address
                subject: emailContent.subject,
                html: emailContent.htmlBody,
                reply_to: email // Set the user's email as the reply-to address for easy response
            })
        });

        if (!sendEmailResponse.ok) {
            const errorBody = await sendEmailResponse.json();
            console.error('Resend API error:', errorBody);
            throw new Error('Failed to send email via Resend.');
        }

        return new Response(JSON.stringify({ success: true, message: 'Message sent successfully.' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Contact form API error:', error);
        return new Response(JSON.stringify({ success: false, error: 'An error occurred while processing your message.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}