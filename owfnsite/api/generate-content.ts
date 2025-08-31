
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
        return res.status(500).json({ success: false, error: "Server configuration error." });
    }

    try {
        const { prompt, context, language } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, error: 'A valid prompt is required.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        let systemInstruction = "You are a creative and helpful content writer.";

        if (context === 'blog') {
            systemInstruction = `You are a content writer for a humanitarian project's blog called OWFN. Your tone should be hopeful, engaging, and professional. Based on the user's prompt, generate a compelling blog post of about 200-300 words. Respond ONLY with the generated text, without any titles, markdown, or extra formatting. The response must be in ${language || 'English'}.`;
        } else if (context === 'case_description') {
            systemInstruction = `You are a copywriter for a humanitarian organization called OWFN. Your task is to write a short, emotional, and impactful description for a new social cause, based on the user's key points. The goal is to inspire people to donate. The tone should be serious but hopeful. Respond ONLY with the generated text (around 100-150 words), without any titles, markdown, or extra formatting. The response must be in ${language || 'English'}.`;
        } else if (context === 'case_title') {
            systemInstruction = `You are a copywriter for a humanitarian organization. Based on the user's key points for a social cause, generate 5 short, impactful, and compelling title options. Respond ONLY with the 5 titles, each on a new line. Do not number them or add any other text. The response must be in ${language || 'English'}.`;
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { systemInstruction }
        });

        const generatedText = response.text;
        
        if (!generatedText || !generatedText.trim()) {
             return res.status(500).json({ success: false, error: "AI failed to generate content." });
        }
        
        return res.status(200).json({ success: true, text: generatedText.trim() });

    } catch (error) {
        console.error('AI content generation API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while generating content.' });
    }
}
