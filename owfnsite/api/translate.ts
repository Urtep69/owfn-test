import { GoogleGenAI, Type } from "@google/genai";

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
        
        console.log(`Translation request (JSON mode). Target: ${targetLanguage}, Text: "${text.substring(0, 50)}..."`);

        if (!text || !text.trim()) {
            // Return the original text if it's empty or just whitespace
            return new Response(JSON.stringify({ text: text || '' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please translate the following text into ${targetLanguage}:\n\n---\n${text}\n---`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translation: {
                            type: Type.STRING,
                            description: `The text translated into ${targetLanguage}.`
                        }
                    },
                    propertyOrdering: ["translation"],
                },
                temperature: 0.1,
            },
        });
        
        const jsonString = response.text;
        if (!jsonString) {
            console.error(`Translation API returned an empty response text. Target: ${targetLanguage}, Input: "${text.substring(0,100)}..."`);
            throw new Error("API returned an empty response.");
        }

        const jsonObject = JSON.parse(jsonString);
        const translatedText = jsonObject.translation;

        if (!translatedText || !translatedText.trim()) {
             console.error(`Translation from JSON object was empty. Target: ${targetLanguage}, Input: "${text.substring(0,100)}..." Full API response:`, JSON.stringify(response, null, 2));
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
