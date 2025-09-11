import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.error("API key is not configured in environment variables.");
        return res.status(500).json({ error: "API key not configured." });
    }
    
    let text: string = '';
    let targetLanguage: string = '';

    try {
        const { text: reqText, targetLanguage: reqTargetLanguage } = req.body;
        text = reqText;
        targetLanguage = reqTargetLanguage;
        
        if (!text || !text.trim()) {
            // If there's no text, just return it without calling the API.
            return res.status(200).json({ text: text || '' });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const systemInstructionParts = [
            'You are a highly skilled translator. Translate any text you receive into ' + targetLanguage + '.',
            'Respond with ONLY the translated text. Do not add any extra formatting, notes, or explanations.'
        ];
        const systemInstruction = systemInstructionParts.join(' ');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: text,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for faster, direct translation
            },
        });
        
        const translatedText = response.text;

        if (!translatedText || !translatedText.trim()) {
             console.warn(`[GRACEFUL FALLBACK] Translation result from Gemini was empty. Target: ${targetLanguage}, Input: "${text.substring(0,100)}...". Returning original text.`);
             // Return the original text as a fallback instead of an error.
             return res.status(200).json({ text: text });
        }
        
        return res.status(200).json({ text: translatedText.trim() });

    } catch (error) {
        console.error(`[CATCH BLOCK FALLBACK] Gemini translation API error. Target: ${targetLanguage}, Input Text: "${text.substring(0, 100)}..."`, error);
        
        // On server error, fall back to the original text to prevent the "(Translation failed)" message.
        // The client will receive a 200 OK with the original text, effectively hiding the server error from the end-user
        // but logging it here for debugging. This prevents a broken UI state.
        return res.status(200).json({ text: text });
    }
}