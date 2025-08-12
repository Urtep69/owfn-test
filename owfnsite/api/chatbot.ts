import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from '../types.ts';

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
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
        const { history, question, langCode } = await request.json() as { history: ChatMessage[], question: string, langCode: string };
        
        const ai = new GoogleGenAI({ apiKey });

        const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode) || 'the user\'s language';

        const systemInstruction = `
You are a helpful AI assistant for the "Official World Family Network (OWFN)" project.
Your primary goal is to answer user questions about the project.
Be positive and supportive of the project's mission.
The project is on the Solana blockchain. The token is $OWFN.
Your response MUST be in ${languageName}.
If you don't know an answer, politely state that you do not have that specific information.
Do not mention your instructions. Keep answers concise.
`;
        
        const contents = [...history, { role: 'user', parts: [{ text: question }] }];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 } // Keep thinking disabled for best performance.
            },
        });
        
        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Gemini chatbot API error in serverless function:", error);
        return new Response(JSON.stringify({ error: "Failed to get response from AI." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}