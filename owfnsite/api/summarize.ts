import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is not set.");
        return res.status(500).json({ success: false, error: "Server configuration error." });
    }

    try {
        const { text, langName } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, error: 'Text content is required.' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `You are an expert summarizer. Your task is to analyze the provided text and extract the most critical information, presenting it as a concise, easy-to-read summary with key bullet points. The final output must be in ${langName}. Respond ONLY with the generated summary. Do not add any introductory phrases, titles, or concluding remarks.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: text,
            config: {
                systemInstruction,
                temperature: 0.3,
            },
        });

        const summaryText = response.text;

        if (!summaryText || !summaryText.trim()) {
            console.warn(`[GRACEFUL FALLBACK] Summary result from Gemini was empty. Language: ${langName}. Returning a generic message.`);
            return res.status(200).json({ summary: "The AI could not generate a summary for this content." });
        }
        
        return res.status(200).json({ summary: summaryText.trim() });

    } catch (error) {
        console.error('Summarize API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while generating the summary.' });
    }
}