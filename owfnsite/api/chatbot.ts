import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ChatMessage } from '../types.ts';

// Helper function to create a valid, alternating user/model history
function buildValidHistory(history: unknown): ChatMessage[] {
    const cleanHistory = Array.isArray(history)
        ? history.filter((msg): msg is ChatMessage =>
            msg && typeof msg === 'object' &&
            (msg.role === 'user' || msg.role === 'model') &&
            Array.isArray(msg.parts) && msg.parts.length > 0 &&
            typeof msg.parts[0]?.text === 'string' && msg.parts[0].text.trim() !== ''
          )
        : [];

    const firstUserIndex = cleanHistory.findIndex(msg => msg.role === 'user');
    if (firstUserIndex === -1) return [];

    const validHistory: ChatMessage[] = [];
    let lastRole: 'user' | 'model' | null = null;
    const historyToProcess = cleanHistory.slice(firstUserIndex);

    for (const message of historyToProcess) {
        if (message.role !== lastRole) {
            validHistory.push(message);
            lastRole = message.role;
        }
    }
    
    if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
        validHistory.pop();
    }
    return validHistory;
}

// Main serverless function handler using Vercel's Node.js signature
export default async function handler(req: VercelRequest, res: VercelResponse) {
    
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY environment variable is not set.");
            return res.status(500).json({ error: "Server configuration error." });
        }
        
        // Vercel automatically parses the body for the Node.js runtime
        const { history, question, langCode } = req.body;

        if (!question || typeof question !== 'string' || question.trim() === '') {
            return res.status(400).json({ error: 'Invalid question provided.' });
        }

        const languageMap: Record<string, string> = {
            en: 'English', zh: 'Chinese', nl: 'Dutch', fr: 'French',
            de: 'German', hu: 'Hungarian', it: 'Italian', ja: 'Japanese',
            ko: 'Korean', pt: 'Portuguese', ro: 'Romanian', ru: 'Russian',
            sr: 'Serbian', es: 'Spanish', tr: 'Turkish'
        };
        const languageName = languageMap[langCode as string] || 'English';
        
        const systemInstruction = `You are a helpful AI assistant for the "Official World Family Network (OWFN)" project...`; // The long prompt text
        
        const contents = [...buildValidHistory(history), { role: 'user', parts: [{ text: question }] }];

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: systemInstruction }] },
            })
        });

        if (!geminiResponse.ok || !geminiResponse.body) {
            const errorText = await geminiResponse.text();
            console.error("Gemini API Error:", errorText);
            return res.status(502).json({ error: `AI API Error: ${geminiResponse.status}` });
        }

        res.setHeader('Content-Type', 'application/json-seq');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = geminiResponse.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const json = JSON.parse(line.substring(6));
                        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                            res.write(JSON.stringify({ type: 'chunk', data: text }) + '\n');
                        }
                    } catch (e) { /* Ignore incomplete JSON */ }
                }
            }
        }
        res.write(JSON.stringify({ type: 'end' }) + '\n');
        res.end();

    } catch (error) {
        console.error("Fatal error in chatbot handler:", error);
        res.status(500).json({ error: "A critical server error occurred." });
    }
}
