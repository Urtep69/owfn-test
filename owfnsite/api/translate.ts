import { GoogleGenAI } from "@google/genai";

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API key is not configured in environment variables.");
        return new Response(JSON.stringify({ error: "API key not configured." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    
    let text: string = '';
    let targetLanguage: string = '';

    try {
        const body = await request.json();
        text = body.text;
        targetLanguage = body.targetLanguage;
        
        if (!text || !text.trim()) {
            // If there's no text, just return it without calling the API.
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
                systemInstruction: `You are a highly skilled translator. Translate any text you receive into ${targetLanguage}. Respond with ONLY the translated text. Do not add any extra formatting, notes, or explanations.`,
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster, direct translation
            },
        });
        
        const translatedText = response.text;

        if (!translatedText || !translatedText.trim()) {
             console.warn(`[GRACEFUL FALLBACK] Translation result from Gemini was empty. Target: ${targetLanguage}, Input: "${text.substring(0,100)}...". Returning original text.`);
             // Return the original text as a fallback instead of an error.
             return new Response(JSON.stringify({ text: text }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        return new Response(JSON.stringify({ text: translatedText.trim() }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`[CATCH BLOCK FALLBACK] Gemini translation API error. Target: ${targetLanguage}, Input Text: "${text.substring(0, 100)}..."`, error);
        
        // On server error, fall back to the original text to prevent the "(Translation failed)" message.
        // The client will receive a 200 OK with the original text, effectively hiding the server error from the end-user
        // but logging it here for debugging. This prevents a broken UI state.
        return new Response(JSON.stringify({ text: text }), {
            status: 200, 
            headers: { 'Content-Type': 'application/json' },
        });
    }
}