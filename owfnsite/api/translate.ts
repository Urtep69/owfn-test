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
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: text,
            config: {
                systemInstruction: `You are an expert translator. Translate the text to ${targetLanguage}. Respond with only the translated text, without any introductory phrases, explanations, or quotation marks.`,
            }
        });

        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Gemini translation API error in serverless function:", error);
        return new Response(JSON.stringify({ error: "Failed to get translation from AI." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
