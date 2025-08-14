import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from '../types.ts';

/**
 * Sanitizes and structures the chat history into a valid, alternating sequence of 'user' and 'model' roles.
 * This function is exceptionally defensive, rebuilding the history from scratch to guarantee API compatibility and prevent crashes.
 * @param history The raw chat history from the client.
 * @returns A structured and valid chat history array that always ends with a model message or is empty.
 */
function sanitizeAndStructureHistory(history: ChatMessage[]): ChatMessage[] {
    if (!Array.isArray(history) || history.length === 0) {
        return [];
    }

    // Step 1: Filter for only structurally valid messages with non-empty, non-whitespace text.
    const validMessages = history.filter(msg =>
        msg &&
        typeof msg === 'object' && // Extra safety check
        (msg.role === 'user' || msg.role === 'model') &&
        Array.isArray(msg.parts) &&
        msg.parts.length > 0 &&
        msg.parts[0] &&
        typeof msg.parts[0] === 'object' && // Extra safety check
        typeof msg.parts[0].text === 'string' &&
        msg.parts[0].text.trim() !== ''
    );

    if (validMessages.length === 0) {
        return [];
    }

    const finalHistory: ChatMessage[] = [];
    
    // Step 2: Find the index of the first 'user' message to start the conversation correctly.
    const firstUserIndex = validMessages.findIndex(msg => msg.role === 'user');
    if (firstUserIndex === -1) {
        return []; // A valid history for the API must logically start with a user message.
    }

    // Step 3: Rebuild the history from the first user message, strictly enforcing role alternation.
    let lastRole: 'user' | 'model' | null = null;
    for (let i = firstUserIndex; i < validMessages.length; i++) {
        const message = validMessages[i];
        if (message.role !== lastRole) {
            finalHistory.push(message);
            lastRole = message.role;
        }
    }

    // Step 4: The history provided to the Gemini API must end with a 'model' role
    // before the new user question is appended. If it ends with 'user', pop it.
    if (finalHistory.length > 0 && finalHistory[finalHistory.length - 1].role === 'user') {
        finalHistory.pop();
    }
    
    return finalHistory;
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

        // **DEFINITIVE FIX**: Wrap text extraction in a try/catch to handle blocked or empty responses gracefully.
        try {
            responseText = response.text;
            if (!responseText || responseText.trim() === '') {
                // This case handles a successful API call that returned an empty string.
                console.warn(`Gemini response was empty. Fallback message will be used.`);
                const fallbackMessages: { [key: string]: string } = {
                    'ro': "Îmi pare rău, dar nu pot genera un răspuns în acest moment. Vă rugăm să încercați o altă întrebare.",
                    'en': "I'm sorry, but I can't generate a response right now. Please try a different question."
                };
                responseText = fallbackMessages[langCode] || fallbackMessages['en'];
            }
        } catch (e) {
             // This block will catch errors from accessing .text, which typically happens
            // when the prompt or response is blocked by safety settings.
            console.warn('Could not get text from Gemini response (likely blocked).', {
                promptFeedback: response?.promptFeedback,
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