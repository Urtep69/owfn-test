import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from '../types.ts';

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
        const history: ChatMessage[] = body.history || [];
        const question: string = body.question;
        const langCode: string = body.langCode || 'en';

        if (!question || typeof question !== 'string') {
            return new Response(JSON.stringify({ error: "Invalid request: 'question' is required." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        if (!Array.isArray(history)) {
             return new Response(JSON.stringify({ error: "Invalid request: 'history' must be an array." }), {
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
        
        // Filter out any potentially empty model turns from history, which can cause API errors.
        const sanitizedHistory = history.filter(msg => 
            !(msg.role === 'model' && (!msg.parts || msg.parts.length === 0 || !msg.parts[0].text.trim()))
        );

        const contents = [...sanitizedHistory, { role: 'user', parts: [{ text: question }] }];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return new Response(JSON.stringify({ text: response.text }), {
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
