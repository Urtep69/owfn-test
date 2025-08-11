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
        
        const prompt = `Please translate the following text into ${targetLanguage}:\n\n"${text}"`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: `You are an expert translator. Your sole purpose is to translate the text provided. Respond ONLY with the translated text, without any additional commentary, introductions, or quotation marks.`,
                temperature: 0,
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
