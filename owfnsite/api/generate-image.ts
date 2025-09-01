import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("CRITICAL: GEMINI_API_KEY is not set for image generation.");
        return res.status(500).json({ error: "Server configuration error for image generation." });
    }

    try {
        const { prompt: userPrompt } = req.body;
        if (!userPrompt) {
            return res.status(400).json({ error: 'A descriptive prompt is required.' });
        }

        const ai = new GoogleGenAI({ apiKey });

        const fullPrompt = `${userPrompt}, digital art, heartwarming, vibrant colors, beautiful, masterpiece`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return res.status(200).json({ image: base64ImageBytes });
        } else {
            throw new Error("Image generation failed or returned no images.");
        }

    } catch (error) {
        console.error("Error in generate-image API:", error);
        return res.status(500).json({ error: "An error occurred while generating the image." });
    }
}