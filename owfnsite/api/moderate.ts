import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string' || message.trim() === '') {
            return res.status(200).json({ isToxic: false, reason: '' });
        }

        const prompt = `Analizează următorul mesaj pentru a determina dacă este toxic. Mesajul este considerat toxic dacă conține discurs de ură, insulte, spam, înșelătorii (scams), informații personale sensibile sau un limbaj extrem de neadecvat. Răspunde doar cu JSON.

Mesaj: "${message}"`;
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isToxic: {
                            type: Type.BOOLEAN,
                            description: "True dacă mesajul este toxic, altfel false."
                        },
                        reason: {
                            type: Type.STRING,
                            description: "O explicație scurtă și politicoasă în română de ce mesajul a fost blocat, dacă este toxic. De exemplu: 'Mesajul pare a fi spam.' sau 'Vă rugăm să mențineți un limbaj respectuos.' Lasă gol dacă nu este toxic."
                        }
                    },
                    propertyOrdering: ["isToxic", "reason"],
                }
            }
        });

        const moderationResult = JSON.parse(response.text);
        
        return res.status(200).json(moderationResult);

    } catch (error) {
        console.error("Moderation API error:", error);
        // Fail open - if moderation fails, allow the message
        return res.status(200).json({ isToxic: false, reason: '' });
    }
}
