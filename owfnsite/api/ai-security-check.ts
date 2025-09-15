
import { GoogleGenAI, Type } from "@google/genai";
import { OWFN_MINT_ADDRESS } from '../lib/constants.js';

const HELIUS_API_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const heliusApiKey = process.env.HELIUS_API_KEY;

    if (!geminiApiKey || !heliusApiKey) {
        console.error("CRITICAL: API keys are not set.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        // Step 1: Fetch on-chain data from Helius
        const heliusResponse = await fetch(HELIUS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'owfn-security-check',
                method: 'getAsset',
                params: { id: OWFN_MINT_ADDRESS },
            }),
        });
        
        if (!heliusResponse.ok) throw new Error(`Helius API Error: ${heliusResponse.status}`);
        
        const heliusData = await heliusResponse.json();
        const asset = heliusData.result;

        if (!asset) throw new Error("Could not find asset data from Helius.");

        let mintAuthority: string | null = null;
        let freezeAuthority: string | null = null;
        
        if (Array.isArray(asset.authorities)) {
            for (const authority of asset.authorities) {
                if (authority?.scopes?.includes('mint')) mintAuthority = authority.address;
                if (authority?.scopes?.includes('freeze')) freezeAuthority = authority.address;
            }
        }

        const onChainData = {
            mintable: !!mintAuthority,
            freezable: !!freezeAuthority,
            token_standard: asset.interface,
            ownership_minted: asset.ownership?.owner === mintAuthority,
        };

        // Step 2: Send data to Gemini for analysis
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const prompt = `You are a Solana security expert. Your task is to analyze the provided on-chain data for a token and generate a list of security points for investors. For each point, provide a status icon (✅, ❌, or ℹ️), a title, and a brief, easy-to-understand explanation.

On-Chain Data:
${JSON.stringify(onChainData, null, 2)}
`;
        const schema = {
            type: Type.OBJECT,
            properties: {
                analysis: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            icon: { type: Type.STRING },
                            title: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        },
                        required: ["icon", "title", "explanation"]
                    }
                }
            },
            required: ["analysis"]
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonResponse = JSON.parse(response.text);
        return res.status(200).json(jsonResponse);

    } catch (error) {
        console.error("Error in AI security check API:", error);
        return res.status(500).json({ error: "Failed to perform AI security analysis." });
    }
}