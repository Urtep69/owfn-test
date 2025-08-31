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

        const prompt = `You are a social media marketing expert for a humanitarian crypto project called Official World Family Network (OWFN). Your task is to generate a single, unique, ready-to-share social media post (like a tweet, under 280 characters) to encourage community growth and support. The post MUST be in ${languageName}.

Internally, choose one of the following themes for the post, but do not mention the theme in your response:
- The core mission of transparent aid.
- The power of the OWFN community.
- The benefits of using the Solana blockchain.
- The ongoing presale.
- The project's vision for a better world.

Your response MUST be ONLY the text of the social media post itself. Do NOT include any prefixes, titles, labels like "Option 1:", markdown formatting like asterisks (**), or any other explanatory text. The post should be inspiring and must include relevant hashtags like #OWFN, #Solana, #CryptoForGood, and #SocialImpact.

Generate the post now.`;

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
