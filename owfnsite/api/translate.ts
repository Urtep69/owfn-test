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

        // If the input text is empty or just whitespace, return it as is to avoid unnecessary API calls.
        if (!text || !text.trim()) {
            return new Response(JSON.stringify({ text: text || '' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: text, // Pass the raw text as the main content for translation.
            config: {
                // Provide a clear and direct system instruction for the translation task.
                systemInstruction: `You are a professional translation engine. Your task is to translate the user's input text into ${targetLanguage}. You must respond with ONLY the translated text. Do not add any extra commentary, introductions, explanations, or any surrounding text like quotation marks. Your output must be the raw translated text and nothing else.`,
                temperature: 0, // Use 0 for deterministic, direct translation.
            }
        });
        
        // Even with instructions, models can sometimes add extra formatting. Clean the response as a safeguard.
        let translatedText = response.text.trim();
        if ((translatedText.startsWith('"') && translatedText.endsWith('"'))) {
            translatedText = translatedText.substring(1, translatedText.length - 1);
        }

        return new Response(JSON.stringify({ text: translatedText }), {
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
