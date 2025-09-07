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
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
            return res.status(400).json({ success: false, error: 'A descriptive prompt is required.' });
        }
        
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Artistic, hopeful, and inspiring digital art style. ${prompt}. High quality, detailed, vibrant colors.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Image generation failed or returned no images.");
        }

        const base64Image = response.generatedImages[0].image.imageBytes;

        return res.status(200).json({ success: true, base64Image });

    } catch (error) {
        console.error('Image generation API error:', error);
        return res.status(500).json({ success: false, error: 'An error occurred while generating the image.' });
    }
}