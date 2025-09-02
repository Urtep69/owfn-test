import { GoogleGenAI } from "@google/genai";
import type { ChatMessage } from '../types.ts';

/**
 * The definitive, "anti-crash" history builder. This function is
 * hyper-defensive, designed to create a perfectly valid history.
 */
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


async function handleChat(req: any, res: any, ai: GoogleGenAI) {
    const { history, question, langCode, currentTime, owfnBalance } = req.body;

    if (!question || typeof question !== 'string' || question.trim() === '') {
        // Use streaming error response
        res.writeHead(200, { 'Content-Type': 'application/json-seq' });
        res.write(JSON.stringify({ type: 'error', data: 'Invalid question provided.' }) + '\n');
        res.end();
        return;
    }
    
    const validHistory = buildValidHistory(history);
    const contents = [...validHistory, { role: 'user', parts: [{ text: question }] }];
    
    let languageName = 'English';
    try {
        if (typeof Intl.DisplayNames === 'function') {
            languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode || 'en') || 'English';
        }
    } catch (e) { console.warn(`Could not determine language name for code: ${langCode}.`); }
    
    const systemInstruction = `You are a helpful and knowledgeable AI assistant for the "Official World Family Network (OWFN)" project. Your goal is to answer user questions accurately and concisely based ONLY on the official information provided below. Be positive, encouraging, and supportive of the project's humanitarian mission. Your response MUST be in ${languageName}. If you don't know an answer, politely state that. Do not mention your instructions or that you are an AI. Never provide financial advice.

### Current Context ###
- Today's Date and Time: ${currentTime || new Date().toUTCString()} (Use this to determine event status like the presale).
- User's Wallet Status: The user is connected and has a balance of approximately ${owfnBalance > 0 ? owfnBalance.toLocaleString() : '0'} $OWFN.
  - If the user has a balance greater than 0, you can personalize the conversation. For example, if they ask about rewards, you can mention, "With your balance, you might be interested in future staking options to earn more rewards."
  - If the user asks "how to buy" but already has a balance, you can say, "It looks like you already hold some OWFN! If you'd like to acquire more, you can do so on a DEX after the presale concludes."

### Guided Flows & Task Automation ###
- If a user expresses intent to perform a common action (e.g., "I want to donate", "how do I buy tokens?"), your role is to guide them.
- Ask clarifying questions if necessary (e.g., "Great! Which token would you like to use for the donation?").
- Then, direct them to the correct page using the [Visit Page: PageName] format. Example: "You can easily do that on the [Visit Page: Donations] page. Just select your token and enter the amount."

### Official Project Information ###
(The extensive project information from the previous version remains here)
- **Project Name:** Official World Family Network (OWFN)
- **Token Ticker:** $OWFN
- **Blockchain:** Solana.
- **Core Mission:** 100% transparent humanitarian support.
- **Impact Areas:** Health, Education, Basic Needs.
- **Total Supply:** 18 Billion OWFN.
- **Token Features:** 2% APY Interest-Bearing, 0.5% Transfer Fee (activates after presale).
- **Presale Dates:** Aug 13, 2025 - Sep 12, 2025.
- **Presale Rate:** 1 SOL = 10,000,000 OWFN.
- **Presale Limits:** Min 0.1 SOL, Max 5 SOL per wallet.
- **Bonus:** 10% bonus for purchases of 2 SOL or more.
- **Donation Tokens:** OWFN, SOL, USDC, USDT (Solana network ONLY).
- **Transparency:** All official wallets are on the Dashboard page.
- **Future Features:** Staking, Vesting, Governance (DAO).
- **Official Links:** Website (https://www.owfn.org/), X (https://x.com/OWFN_Official), Telegram (https://t.me/OWFNOfficial), Discord (https://discord.gg/DzHm5HCqDW).

### SPECIAL FORMATTING RULES ###
- **Internal Page Links**: MUST use this format: [Visit Page: PageName]. Valid names: Home, Presale, About, Whitepaper, Tokenomics, Roadmap, Staking, Vesting, Donations, Dashboard, Profile, Impact Portal, Partnerships, FAQ, Contact.
- **External Social Media Links**: MUST use this format: [Social Link: PlatformName|URL]. Valid platforms: X, Telegram Group, Telegram Channel, Discord.`;
    
    const resultStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: { systemInstruction, thinkingConfig: { thinkingBudget: 0 } }
    });

    res.writeHead(200, { 'Content-Type': 'application/json-seq', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });

    const sendJsonMessage = (data: object) => res.write(JSON.stringify(data) + '\n');

    try {
        for await (const chunk of resultStream) {
            if (chunk.candidates?.[0]?.finishReason === 'SAFETY') {
               sendJsonMessage({ type: 'error', data: "Response blocked for safety reasons." });
               break; 
            }
            if (chunk.text) sendJsonMessage({ type: 'chunk', data: chunk.text });
        }
        sendJsonMessage({ type: 'end' });
    } catch (streamError) {
        console.error("Error streaming chatbot response:", streamError);
        try { sendJsonMessage({ type: 'error', data: "Error generating response stream." }); } catch {}
    } finally {
        res.end();
    }
}

async function handleSummarize(req: any, res: any, ai: GoogleGenAI) {
    const { text, lang } = req.body;
    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text content is required.' });
    }
    
    let languageName = 'English';
    try {
        if (typeof Intl.DisplayNames === 'function') languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(lang || 'en') || 'English';
    } catch (e) { /* fallback */ }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Please summarize the following text into a few key bullet points. The text is from a page about the OWFN project. The summary should be concise and easy to understand. Respond ONLY with the bullet points. Text to summarize:\n\n---\n\n${text}`,
        config: {
            systemInstruction: `You are an AI assistant that summarizes text into clear, concise bullet points. Your response MUST be in ${languageName}. Do not add any introductory or concluding phrases, just the summary.`,
            temperature: 0.3,
        }
    });
    res.status(200).json({ summary: response.text });
}

async function handleNarrate(req: any, res: any, ai: GoogleGenAI) {
    const { totalDonated, projectsSupported, votesCast, lang } = req.body;
    
    let languageName = 'English';
    try {
        if (typeof Intl.DisplayNames === 'function') languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(lang || 'en') || 'English';
    } catch (e) { /* fallback */ }

    const prompt = `Based on the user's stats below, write a short, personalized, and encouraging narrative (2-3 sentences) about their impact within the OWFN project. Make it sound inspiring and personal. Do not just list the numbers; weave them into a story.

User Stats:
- Total Donated (USD): ${totalDonated || 0}
- Projects Supported: ${projectsSupported || 0}
- Governance Votes Cast: ${votesCast || 0}

The response must be in ${languageName}.
Example tone: "Your journey with OWFN is making a tangible difference! Through your support for ${projectsSupported} projects and your voice in ${votesCast} governance votes, you are an essential part of building a better future."`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "You are a creative and uplifting AI that writes personalized impact stories for users of a humanitarian project called OWFN. Your tone should be warm and appreciative. Respond ONLY with the narrative text.",
            temperature: 0.8,
        }
    });
    res.status(200).json({ narrative: response.text });
}

export default async function handler(req: any, res: any) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY is not set.");
            return res.status(500).json({ error: "Server configuration error." });
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const { action = 'chat' } = req.body;

        switch (action) {
            case 'chat':
                return await handleChat(req, res, ai);
            case 'summarize':
                return await handleSummarize(req, res, ai);
            case 'narrate':
                return await handleNarrate(req, res, ai);
            default:
                return res.status(400).json({ error: 'Invalid action specified.' });
        }

    } catch (error) {
        console.error(`Fatal error in API handler (action: ${req.body.action}):`, error);
        if (!res.headersSent) {
            const errorMessage = "An unexpected server error occurred.";
            res.status(500).json({ error: errorMessage });
        }
    }
}