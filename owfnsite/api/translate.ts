import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "API key not configured." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    try {
        const { text, targetLanguage } = await request.json();

        if (!text || !text.trim()) {
            return new Response(JSON.stringify({ text: text || '' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        // Using the Chat API for a more robust, instruction-following translation task.
        const chat: Chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: `You are a professional translator. Your only task is to translate the user's text into the specified language. You must output ONLY the translated text, without any additional text, formatting, or quotation marks.`,
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 },
            }
        });

        const response: GenerateContentResponse = await chat.sendMessage({
            message: `Translate the following text to ${targetLanguage}: "${text}"`
        });

        const translatedText = response.text.trim();
        
        if (!translatedText) {
             throw new Error("Translation resulted in an empty string.");
        }

        return new Response(JSON.stringify({ text: translatedText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Gemini translation API error in serverless function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return new Response(JSON.stringify({ error: `Failed to get translation from AI: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
