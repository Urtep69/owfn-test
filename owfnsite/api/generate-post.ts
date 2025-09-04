import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Define fallback posts here for use in case of any error
    const getFallbackPost = () => {
        const fallbackPosts: string[] = [
            "Join the Official World Family Network (OWFN) movement! We're using #Solana to build a better future with transparent aid. Get involved today! #OWFN #CryptoForGood #SocialImpact",
            "Transparency is key to real change. That's why OWFN is built on #Solana, ensuring every contribution makes a difference. See how we're changing lives. #OWFN #SocialImpact #Blockchain",
            "Be part of something bigger. The OWFN presale is your chance to support a project dedicated to global humanitarian aid. Let's build a better world together. #OWFN #Presale #CryptoForGood",
            "Community is our strength. Together, we can fund projects in health, education, and basic needs worldwide. Join the Official World Family Network. #OWFN #Community #SocialImpact #Solana",
            "Imagine a world where help reaches those in need instantly and transparently. That's the vision of OWFN, powered by the speed of #Solana. Join us. #OWFN #Vision #CryptoForGood"
        ];
        return fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)];
    };

    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is not set.");
        return res.status(200).json({ post: getFallbackPost() });
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

        const themes = [
            "the core mission of transparent humanitarian aid and helping those in need",
            "the power of the OWFN global community coming together for good",
            "the benefits of using the fast and transparent Solana blockchain",
            "the ongoing presale and how participation directly fuels social projects",
            "the project's vision for a more connected and compassionate world",
            "an emotional appeal about making a real-world difference together",
            "the 2% automatic APY for holders as a thank you for their support"
        ];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        const prompt = `Act as an eloquent and empathetic community ambassador for a humanitarian crypto project called Official World Family Network (OWFN). Your task is to generate a single, unique, ready-to-share social media post (like a tweet, under 280 characters). The post's tone should be inspiring, emotional, and respectful. It must encourage community growth and support for the project's presale and humanitarian mission.

The post MUST be in ${languageName}.
Focus this specific post on the theme of: "${randomTheme}".

Crucially, your entire response MUST be ONLY the text of the social media post itself. Do NOT include any prefixes, titles, labels like "Post:", markdown formatting like asterisks or quotes, or any other explanatory text. The post must include relevant and powerful hashtags like #OWFN, #Solana, #CryptoForGood, and #SocialImpact.

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
            console.warn("Gemini returned an empty post, serving a fallback.");
            return res.status(200).json({ post: getFallbackPost() });
        }
        
        return res.status(200).json({ post: post.trim().replace(/\"/g, '') });

    } catch (error) {
        console.error("Error in generate-post API, serving fallback:", error);
        return res.status(200).json({ post: getFallbackPost() });
    }
}