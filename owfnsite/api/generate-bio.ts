import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        const { username } = req.body;
        if (!username || typeof username !== 'string') {
            return res.status(400).json({ bio: 'Nume de utilizator invalid.' });
        }

        // In a real app, you'd pull real user stats here. We'll use mocked ones for the prompt.
        const mockStats = [
            "activ în #general-chat",
            "un susținător timpuriu al proiectului",
            "interesat de cauzele educaționale"
        ];
        const randomStat = mockStats[Math.floor(Math.random() * mockStats.length)];

        const prompt = `Ești un scriitor creativ de profiluri pentru rețele sociale, specializat în comunități Web3. Generează o biografie scurtă, cool și captivantă (maximum 150 de caractere) în limba română pentru un membru al comunității proiectului "Official World Family Network" (OWFN).

Numele utilizatorului este "${username}" și este cunoscut pentru că este ${randomStat}.

Fă-o să sune inspirațional, prietenos și axat pe comunitate. NU adăuga ghilimele în jurul biografiei. Răspunde doar cu textul biografiei.`;

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
                maxOutputTokens: 50,
            }
        });
        
        const bio = response.text.trim().replace(/"/g, ''); // Remove quotes

        return res.status(200).json({ bio });

    } catch (error) {
        console.error("Bio generation API error:", error);
        return res.status(500).json({ error: "A apărut o eroare la generarea biografiei." });
    }
}