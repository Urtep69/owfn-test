import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error." });
    }
    
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage || typeof text !== 'string' || typeof targetLanguage !== 'string') {
        return res.status(400).json({ error: "Invalid 'text' or 'targetLanguage' provided." });
    }
    
    if (!text.trim()) {
        return res.status(200).json({ translatedText: text });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: text,
            config: {
                systemInstruction: `You are an expert multilingual translator. Your ONLY task is to translate the user's text into ${targetLanguage}. Do NOT add any notes, explanations, or introductory phrases. Respond with ONLY the translated text. If the text is already in ${targetLanguage}, return it as is.`,
                temperature: 0.1,
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        
        const translatedText = response.text;

        if (!translatedText || !translatedText.trim()) {
             console.warn(`[GRACEFUL FALLBACK] Translation result from Gemini was empty. Target: ${targetLanguage}, Input: "${text.substring(0,100)}...". Returning original text.`);
             return res.status(200).json({ translatedText: text });
        }
        
        return res.status(200).json({ translatedText: translatedText.trim() });

    } catch (error) {
        console.error(`[CATCH BLOCK FALLBACK] Gemini translation API error. Target: ${targetLanguage}, Input Text: "${text.substring(0, 100)}..."`, error);
        return res.status(500).json({ error: "Failed to communicate with translation service." });
    }
}
