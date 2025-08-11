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

        // If the text is empty or just whitespace, return it as is.
        if (!text || !text.trim()) {
            return new Response(JSON.stringify({ text: text || '' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        
        // This is a single-turn, stateless request, so generateContent is more appropriate and efficient.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            // A very direct and structured prompt.
            contents: `Translate the following text from English to ${targetLanguage}. Do not add any extra commentary, notes, or quotation marks. Return ONLY the translated text.\n\nText to translate:\n"""\n${text}\n"""`,
            config: {
                // Keep temperature low for deterministic translation
                temperature: 0, 
                // Disable thinking to optimize for speed and reduce timeout risk on serverless functions.
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        
        const translatedText = response.text;

        // Check for an empty or null response from the model
        if (!translatedText || !translatedText.trim()) {
             console.error("Translation resulted in an empty string. Full API response:", JSON.stringify(response, null, 2));
             throw new Error("Translation resulted in an empty string.");
        }

        return new Response(JSON.stringify({ text: translatedText.trim() }), {
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
