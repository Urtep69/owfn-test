import { GoogleGenAI } from "@google/genai";
import type { CommunityMessage } from '../types.ts';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ summary: 'Nu există mesaje de rezumat.' });
        }
        
        // Format chat history for the prompt
        const chatHistory = messages.map((msg: CommunityMessage) => `User ${msg.senderId.slice(0, 5)}: ${msg.content}`).join('\n');

        const prompt = `Rezumă următoarea conversație într-un singur paragraf concis, în limba română. Identifică subiectele principale și punctele cheie discutate.\n\nCONVERSAȚIE:\n---\n${chatHistory}\n---\n\nREZUMAT CONCIS:`;

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.3,
                maxOutputTokens: 150,
            }
        });
        
        const summary = response.text;

        return res.status(200).json({ summary });

    } catch (error) {
        console.error("Summarization API error:", error);
        return res.status(500).json({ error: "A apărut o eroare la generarea rezumatului." });
    }
}
