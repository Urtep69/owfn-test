import type { ChatMessage } from '../types.ts';

// Vercel Edge Runtime for speed and reliability
export const runtime = 'edge';

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

// Main serverless function handler
export default async function handler(request: Request) {
    const encoder = new TextEncoder();

    // Helper to send JSON messages through the stream
    const sendJsonMessage = (controller: ReadableStreamDefaultController, data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
    };

    try {
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: API_KEY environment variable is not set.");
            // We return a stream with an error, which the client can handle gracefully
            const stream = new ReadableStream({
                start(controller) {
                    sendJsonMessage(controller, { type: 'error', data: 'Server configuration error.' });
                    controller.close();
                }
            });
            return new Response(stream, { status: 200, headers: { 'Content-Type': 'application/json-seq' } });
        }

        const body = await request.json();
        const { history, question, langCode } = body;

        if (!question || typeof question !== 'string' || question.trim() === '') {
             const stream = new ReadableStream({
                start(controller) {
                    sendJsonMessage(controller, { type: 'error', data: 'Invalid question provided.' });
                    controller.close();
                }
            });
            return new Response(stream, { status: 200, headers: { 'Content-Type': 'application/json-seq' } });
        }

        const languageMap: Record<string, string> = {
            en: 'English', zh: 'Chinese', nl: 'Dutch', fr: 'French',
            de: 'German', hu: 'Hungarian', it: 'Italian', ja: 'Japanese',
            ko: 'Korean', pt: 'Portuguese', ro: 'Romanian', ru: 'Russian',
            sr: 'Serbian', es: 'Spanish', tr: 'Turkish'
        };
        const languageName = languageMap[langCode as string] || 'English';
        
        const systemInstruction = `You are a helpful AI assistant for the "Official World Family Network (OWFN)" project...`; // The long prompt remains the same

        const contents = [...buildValidHistory(history), { role: 'user', parts: [{ text: question }] }];

        // Direct fetch call to the Gemini REST API
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: systemInstruction }] },
                generationConfig: {
                    temperature: 0.7,
                }
            })
        });

        if (!geminiResponse.ok || !geminiResponse.body) {
            const errorText = await geminiResponse.text();
            console.error("Gemini API Error:", errorText);
            const stream = new ReadableStream({
                start(controller) {
                    sendJsonMessage(controller, { type: 'error', data: `AI API Error: ${geminiResponse.status}` });
                    controller.close();
                }
            });
            return new Response(stream, { status: 200, headers: { 'Content-Type': 'application/json-seq' } });
        }
        
        // Pipe the response from Gemini directly to the client
        const stream = new ReadableStream({
            async start(controller) {
                const reader = geminiResponse.body!.getReader();
                const decoder = new TextDecoder();
                
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        
                        const chunk = decoder.decode(value, { stream: true });
                        // The response from REST API is slightly different, we need to parse it
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                try {
                                    const json = JSON.parse(line.substring(6));
                                    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                                    if (text) {
                                        sendJsonMessage(controller, { type: 'chunk', data: text });
                                    }
                                } catch (e) {
                                    // Ignore parsing errors for incomplete JSON chunks
                                }
                            }
                        }
                    }
                    sendJsonMessage(controller, { type: 'end' });
                } catch (e) {
                    console.error("Stream processing error:", e);
                    sendJsonMessage(controller, { type: 'error', data: "Error processing AI response." });
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'application/json-seq', 
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            }
        });

    } catch (error) {
        console.error("Fatal error in chatbot handler:", error);
        const errorMessage = "A critical server error occurred.";
        const stream = new ReadableStream({
            start(controller) {
                sendJsonMessage(controller, { type: 'error', data: errorMessage });
                controller.close();
            }
        });
        return new Response(stream, { status: 200, headers: { 'Content-Type': 'application/json-seq' } });
    }
}
