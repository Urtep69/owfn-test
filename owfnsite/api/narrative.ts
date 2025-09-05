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
        const { userStats, langName } = req.body;

        if (!userStats) {
            return res.status(400).json({ success: false, error: 'User stats are required.' });
        }
        
        const statsString = `Total Donated: $${userStats.totalDonated}, Projects Supported: ${userStats.projectsSupported}, Votes Cast: ${userStats.votesCast}`;

        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `You are a deeply creative and empathetic storyteller for the "Official World Family Network" (OWFN) project. Your task is to craft a completely unique, short (2-3 sentences), personalized, and emotionally resonant narrative based on a user's impact statistics. The story must make the user feel profoundly valued and connected to the real-world good they've accomplished. Be highly creative and avoid generic statements, repetition, and clichés at all costs. The narrative MUST be in ${langName}.

Your response MUST ONLY be the narrative text itself. Do not include salutations, filler text, or repeat any stories you may have generated before. Each response must be completely fresh and original. Just the story.`;

        const prompt = `Generate an impact story for a user with the following stats: ${statsString}. Emphasize how their actions translate into real-world help, like building schools or providing medical care.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.8,
            },
        });

        const narrativeText = response.text;

        if (!narrativeText || !narrativeText.trim()) {
            console.warn(`[GRACEFUL FALLBACK] Narrative result from Gemini was empty. Language: ${langName}.`);
            return res.status(200).json({ narrative: "Your support is making a tangible difference in the world. Thank you for being a vital part of the OWFN family!" });
        }
        
        return res.status(200).json({ narrative: narrativeText.trim() });

    } catch (error) {
        console.error('Narrative API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while generating the narrative.' });
    }
}