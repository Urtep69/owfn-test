import { GoogleGenAI } from "@google/genai";
import { en } from '../lib/locales/en.ts';
import { ro } from '../lib/locales/ro.ts';
import { de } from '../lib/locales/de.ts';
import { es } from '../lib/locales/es.ts';
import { ja } from '../lib/locales/ja.ts';
import { fr } from '../lib/locales/fr.ts';
import { pt } from '../lib/locales/pt.ts';
import { ru } from '../lib/locales/ru.ts';
import { it } from '../lib/locales/it.ts';
import { nl } from '../lib/locales/nl.ts';
import { hu } from '../lib/locales/hu.ts';
import { sr } from '../lib/locales/sr.ts';
import { tr } from '../lib/locales/tr.ts';
import { ko } from '../lib/locales/ko.ts';
import { zh } from '../lib/locales/zh.ts';

// Data from constants.ts has been inlined here to make the Edge Function self-contained.
const OWFN_MINT_ADDRESS = 'Cb2X4L46PFMzuTRJ5gDSnNa4X51DXGyLseoh381VB96B';

const TOKEN_DETAILS = {
  totalSupply: 18_000_000_000,
  decimals: 9,
  standard: 'SPL Token 2022',
  extensions: 'Transfer Fee (0.5% after presale), Interest-Bearing (2% APR)',
  presalePrice: '1 SOL = 10,000,000 OWFN',
  dexLaunchPrice: '1 SOL = 8,000,000 OWFN',
};

const DISTRIBUTION_WALLETS = {
  presale: '7vAUf13zSQjoZBU2aek3UcNAuQnLxsUcbMRnBYdcdvDy',
  impactTreasury: 'HJBKht6wRZYNC7ChJc4TbE8ugT5c3QX6buSbEPNYX1k6',
  community: 'EAS2AHoiQkFQsAA7MafifoeAik9BiNNAeAcpiLZZj1fn',
  team: 'Ku2VLgYsVeoUnksyj7CunAEubsJHwU8VpdeBmAEfLfq',
  marketing: '3kuRooixcDGcz9yuSi6QbCzuqe2Ud5mtsiy3b6M886Ex',
  advisors: '6UokF7FtGK4FXz5Hdr2jm146yC5WqyKkByV5L8fAeAW2',
};

const PROJECT_LINKS = {
  website: 'https://www.owfn.org/',
  x: 'https://x.com/OWFN_Official',
  telegramGroup: 'https://t.me/OWFNOfficial',
  telegramChannel: 'https://t.me/OWFN_Official',
  discord: 'https://discord.gg/DzHm5HCqDW',
};

const TOKEN_ALLOCATIONS = [
  { name: 'Impact Treasury & Social Initiatives', value: 6300000000, percentage: 35 },
  { name: 'Community & Ecosystem Growth', value: 5400000000, percentage: 30 },
  { name: 'Presale & Liquidity', value: 2880000000, percentage: 16 },
  { name: 'Team & Founders', value: 270000000, percentage: 15 },
  { name: 'Marketing & Business Development', value: 540000000, percentage: 3 },
  { name: 'Advisors & Partnerships', value: 180000000, percentage: 1 },
];

const ROADMAP_DATA = [
  { quarter: 'Q3 2025', key_prefix: 'roadmap_q3_2025' },
  { quarter: 'Q4 2025', key_prefix: 'roadmap_q4_2025' },
  { quarter: 'Q1 2026', key_prefix: 'roadmap_q1_2026' },
  { quarter: 'Q2 2026 & Beyond', key_prefix: 'roadmap_q2_2026' },
];

const translations: Record<string, Record<string, string>> = {
  en, ro, de, es, ja, fr, pt, ru, it, nl, hu, sr, tr, ko, zh
};

const faqKeys = [
    { q: 'faq_q1', a: 'faq_a1' },
    { q: 'faq_q2', a: 'faq_a2' },
    { q: 'faq_q3', a: 'faq_a3' },
    { q: 'faq_q4', a: 'faq_a4' },
    { q: 'faq_q5', a: 'faq_a5' },
    { q: 'faq_q6', a: 'faq_a6' },
    { q: 'faq_q7', a: 'faq_a7' },
    { q: 'faq_q8', a: 'faq_a8' },
    { q: 'faq_q9', a: 'faq_a9' },
    { q: 'faq_q10', a: 'faq_a10' },
];

// This function generates the knowledge base for the AI.
const generateKnowledgeBase = (langCode: string): string => {
  const t = translations[langCode] || translations['en'];
  const roadmapItems = ROADMAP_DATA.map(phase => `*   **${t[`${phase.key_prefix}_title`]}:** (${phase.quarter}) - ${t[`${phase.key_prefix}_description`]}`).join('\n');
  const faqItems = faqKeys.map(key => `*   **${t[key.q]}**\n    *   ${t[key.a]}`).join('\n\n');

  return `
You are a helpful and friendly AI assistant for the "Official World Family Network (OWFN)" project. Your primary goal is to provide accurate and comprehensive information to users based on the knowledge provided below. Always be positive and supportive of the project's mission. Your response should be in the user's language, which is identified by the language code '${langCode}'.

**1. Core Project Information**

*   **Full Name:** Official World Family Network (OWFN)
*   **Mission:** ${t['about_mission_desc']}
*   **Vision:** ${t['about_vision_desc']}
*   **Core Message:** ${t['home_message']}
*   **Impact Areas:** We focus on three key areas:
    *   **Health:** ${t['about_impact_health_desc']}
    *   **Education:** ${t['about_impact_education_desc']}
    *   **Basic Needs:** ${t['about_impact_needs_desc']}

**2. OWFN Token Details**

*   **Total Supply:** ${TOKEN_DETAILS.totalSupply.toLocaleString()} OWFN
*   **Token Decimals:** ${TOKEN_DETAILS.decimals}
*   **Token Standard:** ${TOKEN_DETAILS.standard} on the Solana blockchain.
*   **Mint Address:** ${OWFN_MINT_ADDRESS}
*   **Active Extensions:** The token utilizes Token 2022 extensions for advanced features:
    *   **Transfer Fee (0.5% after presale):** After the presale concludes, a small 0.5% fee will be activated on all transactions. This acts as an automatic micro-donation, with the full amount directed to the Impact Treasury to continuously fund social cases. This transforms token usage into a continuous contribution to the project's mission.
    *   **Interest-Bearing (2% APR):** This is a technical capability of the token standard. It's not a direct staking APY for holders but an on-chain feature demonstrating the token's advanced nature. The project rewards long-term holders through this mechanism, contributing to social good.
*   **Security:** The OWFN token is designed for maximum security and decentralization.
    *   **Immutability:** The token's core metadata cannot be changed.
    *   **Mint Authority:** Revoked. This means no new tokens can ever be created, ensuring a fixed total supply.
    *   **Freeze Authority:** Revoked. This means no single entity can freeze the holdings of any user, ensuring user autonomy.

**3. Tokenomics & Distribution**

*   **Presale Price:** ${TOKEN_DETAILS.presalePrice}
*   **DEX Launch Price:** ${TOKEN_DETAILS.dexLaunchPrice}
*   **Token Allocation:**
${TOKEN_ALLOCATIONS.map(a => `    *   **${a.name}:** ${a.percentage}% (${a.value.toLocaleString()} OWFN)`).join('\n')}
*   **Official Wallet Addresses:** All project wallets are public for full transparency.
    *   **Presale & Liquidity:** ${DISTRIBUTION_WALLETS.presale}
    *   **Impact Treasury:** ${DISTRIBUTION_WALLETS.impactTreasury}
    *   **Community & Ecosystem:** ${DISTRIBUTION_WALLETS.community}
    *   **Team & Founders:** ${DISTRIBUTION_WALLETS.team}
    *   **Marketing & Biz Dev:** ${DISTRIBUTION_WALLETS.marketing}
    *   **Advisors & Partnerships:** ${DISTRIBUTION_WALLETS.advisors}

**4. Website & Platform Features**

The OWFN website is a central hub for our community and provides full transparency. Key pages include:
*   **Presale:** Our token presale page with live statistics.
*   **Donations:** A portal to donate various cryptocurrencies to support our social causes. All donations go to the Impact Treasury wallet.
*   **Dashboard:** A transparency dashboard showing the real-time balances of all official project wallets.
*   **Impact Portal:** A section to view and learn about the specific social cases we are funding.
*   **Profile:** Once you connect your wallet, you can view your token balances and impact statistics.
*   **Features Coming Soon:** Staking, Vesting, Governance, and Airdrops are planned for the future.

**5. Project Roadmap**

Our roadmap outlines our journey to create a lasting global impact:
${roadmapItems}

**6. Community & Official Links**

*   **Website:** ${PROJECT_LINKS.website}
*   **X (Twitter):** ${PROJECT_LINKS.x}
*   **Telegram Group:** ${PROJECT_LINKS.telegramGroup}
*   **Discord:** ${PROJECT_LINKS.discord}

**7. Frequently Asked Questions (FAQ)**

Here are some common questions and answers:
${faqItems}

**8. Important Instructions for Users**

*   **Donating USDC/USDT:** It is critical that all USDC and USDT donations are sent *only* from the Solana network. Sending from any other network (like Ethereum) will result in a permanent loss of funds.

Remember to be helpful, positive, and stick to the information provided. If a user asks a question you cannot answer with this data, politely state that you do not have that information at the moment but you can answer questions about the project's mission, tokenomics, roadmap, and features.
  `;
};

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
        const knowledgeBase = generateKnowledgeBase(langCode);

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: knowledgeBase,
                thinkingConfig: { thinkingBudget: 0 }
            },
            history: history,
        });

        if (stream) {
            const streamResponse = await chat.sendMessageStream({ message: question });
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
        const response = await chat.sendMessage({ message: question });
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