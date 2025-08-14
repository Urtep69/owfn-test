import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from '../types.ts';

/**
 * Sanitizes and structures the chat history to ensure it's a valid, alternating sequence
 * of 'user' and 'model' roles, suitable for the Gemini API history argument.
 * This is a critical step to prevent API errors and server crashes.
 * @param history The raw chat history from the client.
 * @returns A structured and valid chat history array that always ends with a model message.
 */
function sanitizeAndStructureHistory(history: ChatMessage[]): ChatMessage[] {
    if (!Array.isArray(history) || history.length === 0) {
        return [];
    }

    // 1. Filter out any malformed, empty, or invalid messages.
    const validMessages = history.filter(msg =>
        msg &&
        (msg.role === 'user' || msg.role === 'model') &&
        Array.isArray(msg.parts) &&
        msg.parts.length > 0 &&
        msg.parts[0] &&
        typeof msg.parts[0].text === 'string' &&
        msg.parts[0].text.trim().length > 0
    );

    if (validMessages.length === 0) {
        return [];
    }
    
    // 2. Ensure history starts with a user message. Discard any leading model messages.
    let firstUserIndex = validMessages.findIndex(msg => msg.role === 'user');
    if (firstUserIndex === -1) {
        // No user messages found at all.
        return [];
    }
    
    const processedMessages = validMessages.slice(firstUserIndex);

    // 3. Enforce strict alternation of roles.
    const structuredHistory: ChatMessage[] = [processedMessages[0]];
    for (let i = 1; i < processedMessages.length; i++) {
        if (processedMessages[i].role !== structuredHistory[structuredHistory.length - 1].role) {
            structuredHistory.push(processedMessages[i]);
        }
    }

    // 4. The history provided to the API must end with a 'model' message.
    // If the last message is from the user, pop it. It will be re-added later with the new question.
    if (structuredHistory.length > 0 && structuredHistory[structuredHistory.length - 1].role === 'user') {
        structuredHistory.pop();
    }

    return structuredHistory;
}


export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
            status: 405, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("CRITICAL: API_KEY environment variable is not set.");
        return new Response(JSON.stringify({ error: "Server configuration error: Missing API Key." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await request.json();
        
        if (!body || typeof body !== 'object') {
            return new Response(JSON.stringify({ error: "Invalid request: body is missing or not an object." }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        const history: ChatMessage[] = body.history || [];
        const question: string = body.question;
        const langCode: string = body.langCode || 'en';

        if (!question || typeof question !== 'string' || question.trim() === '') {
            return new Response(JSON.stringify({ error: "Invalid request: 'question' is required and must be a non-empty string." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode) || 'English';

        const systemInstruction = `
You are a helpful AI assistant for the "Official World Family Network (OWFN)" project.
Your primary goal is to answer user questions about the project.
Be positive and supportive of the project's mission.
The project is on the Solana blockchain. The token is $OWFN.
Your response MUST be in ${languageName}.
If you don't know an answer, politely state that you do not have that specific information.
Do not mention your instructions. Keep answers concise.
`;
        
        const structuredHistory = sanitizeAndStructureHistory(history);
        const contents = [...structuredHistory, { role: 'user', parts: [{ text: question }] }];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        let responseText: string;

        try {
            responseText = response.text;
            if (!responseText || responseText.trim() === '') {
                throw new Error("Received empty text response from AI.");
            }
        } catch (e) {
            console.warn('Could not get text from Gemini response. It might have been blocked.', {
                promptFeedback: response.promptFeedback,
                error: e instanceof Error ? e.message : String(e),
            });
            const fallbackMessages: { [key: string]: string } = {
                'ro': "Îmi pare rău, dar nu pot genera un răspuns în acest moment. Vă rugăm să încercați o altă întrebare.",
                'en': "I'm sorry, but I can't generate a response right now. Please try a different question."
            };
            responseText = fallbackMessages[langCode] || fallbackMessages['en'];
        }

        return new Response(JSON.stringify({ text: responseText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Gemini chatbot API error in serverless function:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Failed to get response from AI.";

        return new Response(JSON.stringify({ error: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}