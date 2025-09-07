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
        const { notes, caseTitle, language } = req.body;
        
        if (!notes || !caseTitle || !language) {
            return res.status(400).json({ success: false, error: 'Missing required fields: notes, caseTitle, language.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const systemInstruction = `You are an expert storyteller for a humanitarian organization called OWFN. Your task is to transform raw, factual notes from field operators into a compelling, hopeful, and engaging "Live Update" story for donors. The story must be in ${language}.

Guidelines:
- Start with a strong, engaging opening.
- Weave the raw notes into a narrative. Focus on the human impact and what this progress means for the beneficiaries.
- Maintain a positive and inspiring tone.
- Keep the story concise, around 2-3 paragraphs.
- End with a thank you to the OWFN community for making it possible.
- Respond with ONLY the generated story text. No extra formatting, titles, or explanations.`;
        
        const prompt = `Case Title: "${caseTitle}"\n\nRaw notes from the field:\n---\n${notes}\n---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            },
        });

        const story = response.text;
        
        if (!story || !story.trim()) {
            throw new Error("AI story generation resulted in empty text.");
        }
        
        return res.status(200).json({ success: true, story: story.trim() });

    } catch (error) {
        console.error('Impact story generation API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while generating the story.' });
    }
}
