import { GoogleGenAI } from "@google/genai";

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

        const prompt = `You are a professional translation engine. Your sole task is to translate the following text into ${targetLanguage}. Provide ONLY the translated text as your response. Do not include any extra commentary, introductions, or explanations. Do not wrap the translation in quotation marks.

Text to translate:
"${text}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0,
                thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster, direct translation.
            }
        });
        
        const translatedText = response.text.trim();

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
