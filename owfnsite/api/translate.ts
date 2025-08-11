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
        
        console.log(`Translation request received. Target: ${targetLanguage}, Text: "${text.substring(0, 50)}..."`);

        if (!text || !text.trim()) {
            return new Response(JSON.stringify({ text: text || '' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        // A direct and explicit prompt structure without systemInstruction.
        const prompt = `Translate the following text to ${targetLanguage}. Provide ONLY the translated text, without any additional comments, formatting, or quotation marks.\n\nText to translate:\n"""\n${text}\n"""`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0, 
                thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for speed and directness
            }
        });
        
        const translatedText = response.text;

        if (!translatedText || !translatedText.trim()) {
             console.error(`Translation resulted in an empty string. Target: ${targetLanguage}, Input: "${text.substring(0,100)}..." Full API response:`, JSON.stringify(response, null, 2));
             throw new Error("Translation resulted in an empty string.");
        }
        
        console.log(`Translation successful for target: ${targetLanguage}.`);

        return new Response(JSON.stringify({ text: translatedText.trim() }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error(`Gemini translation API error. Target: ${targetLanguage}, Input Text: "${text.substring(0, 100)}..."`, error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return new Response(JSON.stringify({ error: `Failed to get translation from AI: ${errorMessage}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
