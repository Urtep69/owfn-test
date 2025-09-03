import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is not set.");
        // Return a server error because this is a configuration issue.
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        const { langCode } = req.body;
        
        let languageName = 'English';
        try {
            // Use Intl.DisplayNames to get the English name of the language for the prompt.
            // This is more robust for the AI.
            languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode || 'en') || 'English';
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

        // The prompt is well-structured and already asks for the specific language.
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
            // If the AI returns nothing, it's an error state.
            console.warn("Gemini returned an empty post.");
            throw new Error("AI failed to generate content.");
        }
        
        // Return the successfully generated post.
        return res.status(200).json({ post: post.trim().replace(/\"/g, '') });

    } catch (error) {
        // Catch any error (API key issue, network, AI failure) and return a generic server error.
        // The frontend will display a user-friendly message.
        console.error("Error in generate-post API:", error);
        return res.status(500).json({ error: "Failed to generate post from AI service." });
    }
}