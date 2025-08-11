import { GoogleGenAI } from "@google/genai";

// A concise, self-contained knowledge base. This is defined as a constant
// to ensure it's created only once when the serverless function is initialized,
// drastically reducing memory usage on each request and preventing 500 errors.
const KNOWLEDGE_BASE = `
**About the OWFN Project:**
- **Name:** Official World Family Network (OWFN).
- **Mission:** To build a global, transparent support network for humanity using Solana blockchain technology. We assist with essential needs in health (surgeries, hospitals), education (schools, kindergartens), and basic needs (food, shelter).
- **Core Principle:** We are a community-driven movement. Our strength comes from our supporters. All financial flows are transparent on the blockchain.
- **Key Features:** A website with a Presale page, a Donations portal, a public Dashboard to monitor official wallets, and an Impact Portal to showcase funded social cases. Future features include Staking, Vesting, and Governance.

**About the OWFN Token:**
- **Symbol:** $OWFN
- **Total Supply:** 18 Billion (18,000,000,000). No new tokens can ever be minted.
- **Blockchain:** Solana (Token 2022 standard).
- **Security:** Mint and Freeze authorities are revoked, meaning the supply is fixed and no one can freeze user assets.
- **Tokenomics:**
  - Presale Price: 1 SOL = 10,000,000 OWFN
  - DEX Launch Price: 1 SOL = 8,000,000 OWFN
  - Transfer Fee: A 0.5% fee on transactions will be activated AFTER the presale. This fee funds the Impact Treasury for social causes.
  - Interest-Bearing: The token has a 2% APR capability, rewarding long-term holders.
- **Token Address (Mint):** Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B

**How to Participate:**
- **Buy Tokens:** During the presale event on the official website's 'Presale' page using SOL.
- **Donate:** Use the 'Donations' page to donate crypto (SOL, USDC, USDT) to the Impact Treasury wallet.
- **Spread the Word:** The most powerful way to help is to tell friends, family, and colleagues about our mission.

**Important User Information:**
- **Donating USDC/USDT:** These donations MUST be sent from the Solana network. Sending from other networks (like Ethereum) will result in lost funds.
`;


export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: "API key not configured." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { history, question, langCode, stream } = await request.json();
        
        const ai = new GoogleGenAI({ apiKey });

        const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(langCode) || 'the user\'s language';

        const systemInstruction = `
You are a helpful and friendly AI assistant for the "Official World Family Network (OWFN)" project. Your primary goal is to provide accurate information to users based on the knowledge provided below. Always be positive and supportive of the project's mission.

Your response MUST be in ${languageName} (language code: '${langCode}').

--- KNOWLEDGE BASE ---
${KNOWLEDGE_BASE}
--- END KNOWLEDGE BASE ---

Remember to be helpful, positive, and stick to the information provided. If a user asks a question you cannot answer with this data, politely state that you do not have that information at the moment but you can answer questions about the project's mission, tokenomics, and features.
`;
        
        const contents = [...history, { role: 'user', parts: [{ text: question }] }];

        if (stream) {
            const streamResponse = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    thinkingConfig: { thinkingBudget: 0 }
                },
            });

            const readableStream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of streamResponse) {
                            const text = chunk.text;
                            if (text) {
                                controller.enqueue(new TextEncoder().encode(text));
                            }
                        }
                    } catch (error) {
                         console.error("Error during Gemini stream processing:", error);
                         controller.error(error);
                    } finally {
                        controller.close();
                    }
                }
            });

            return new Response(readableStream, {
                status: 200,
                headers: { 
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Content-Type-Options': 'nosniff',
                },
            });
        }

        // Fallback for non-streaming requests
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });
        
        return new Response(JSON.stringify({ text: response.text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Gemini chatbot API error in serverless function:", error);
        return new Response(JSON.stringify({ error: "Failed to get response from AI." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}