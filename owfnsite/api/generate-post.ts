import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        const { langCode } = req.body;
        
        let languageName = 'English';
        try {
            if (typeof Intl.DisplayNames === 'function') {
                languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode || 'en') || 'English';
            }
        } catch (e) {
             console.warn(`Could not determine language name for code: ${langCode}. Defaulting to English.`);
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a social media marketing expert for a humanitarian crypto project called Official World Family Network (OWFN). Your mission is to generate an engaging, positive, and concise social media post (like a tweet, under 280 characters) to encourage community growth and support. The post MUST be in ${languageName}.

Focus on one of these key aspects of OWFN:
- Its core mission to provide transparent aid.
- The power of the community.
- The benefits of being built on Solana (speed, low fees).
- The ongoing presale and how to participate.
- The vision for a better world.

The post should be inspiring and include relevant hashtags like #OWFN, #Solana, #CryptoForGood, #SocialImpact.

Generate a unique post now.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.9,
                thinkingConfig: { thinkingBudget: 0 },
            }
        });

        const post = response.text;
        
        if (!post || !post.trim()) {
            // Fallback in case of an empty response
            return res.status(200).json({ post: `Join the Official World Family Network (OWFN) movement! We're using #Solana to build a better future with transparent aid. Get involved today! #CryptoForGood #SocialImpact` });
        }
        
        return res.status(200).json({ post: post.trim() });

    } catch (error) {
        console.error("Error in generate-post API:", error);
        return res.status(500).json({ error: "Failed to generate post." });
    }
}
