import { GoogleGenAI } from "@google/genai";

// A list of high-quality, pre-written fallback posts in English.
const fallbackPosts: string[] = [
    "Join the Official World Family Network (OWFN) movement! We're using #Solana to build a better future with transparent aid. Get involved today! #OWFN #CryptoForGood #SocialImpact",
    "Transparency is key to real change. That's why OWFN is built on #Solana, ensuring every contribution makes a difference. See how we're changing lives. #OWFN #SocialImpact #Blockchain",
    "Be part of something bigger. The OWFN presale is your chance to support a project dedicated to global humanitarian aid. Let's build a better world together. #OWFN #Presale #CryptoForGood",
    "Community is our strength. Together, we can fund projects in health, education, and basic needs worldwide. Join the Official World Family Network. #OWFN #Community #SocialImpact #Solana",
    "Imagine a world where help reaches those in need instantly and transparently. That's the vision of OWFN, powered by the speed of #Solana. Join us. #OWFN #Vision #CryptoForGood"
];

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is not set.");
        // Return a fallback post instead of an error to keep the UI functional
        const fallback = fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)];
        return res.status(200).json({ post: fallback });
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

        // More dynamic prompt to increase variety
        const themes = [
            "the core mission of transparent aid",
            "the power of the OWFN community",
            "the benefits of using the Solana blockchain",
            "the ongoing presale and why it matters",
            "the project's vision for a better world",
            "the urgency and importance of contributing now",
        ];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        const prompt = `You are a social media marketing expert for a humanitarian crypto project called Official World Family Network (OWFN). Your task is to generate a single, unique, ready-to-share social media post (like a tweet, under 280 characters) to encourage community growth and support. The post MUST be in ${languageName}.

Focus the post on the theme of: "${randomTheme}".

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
            // If Gemini returns an empty response, send a random fallback.
            const fallback = fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)];
            console.warn("Gemini returned an empty post, serving a fallback.");
            return res.status(200).json({ post: fallback });
        }
        
        return res.status(200).json({ post: post.trim().replace(/\"/g, '') }); // Remove quotes Gemini sometimes adds

    } catch (error) {
        console.error("Error in generate-post API, serving fallback:", error);
        // On any error, serve a random fallback to ensure the user always gets a post.
        const fallback = fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)];
        return res.status(200).json({ post: fallback });
    }
}