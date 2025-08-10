
import { GoogleGenAI } from "@google/genai";
import { TOKEN_DETAILS, TOKEN_ALLOCATIONS, DISTRIBUTION_WALLETS, PROJECT_LINKS, ROADMAP_DATA, OWFN_MINT_ADDRESS } from '../constants.ts';
import { translations } from '../lib/locales/index.ts';

// Safely get the API key to prevent "process is not defined" error in browser environments.
const getApiKey = (): string | undefined => {
  try {
    // This check is crucial for browser compatibility where `process` is not defined.
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not access process.env.API_KEY", e);
  }
  return undefined;
};

const apiKey = getApiKey();
let ai: GoogleGenAI | null = null;
const model = "gemini-2.5-flash";

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  // This warning will appear in the developer console if the API key is not set up in the build environment.
  console.warn("API_KEY environment variable not set. Gemini API features will be disabled.");
}

const enTranslations = translations['en'];

const KNOWLEDGE_BASE = `
You are a helpful and friendly AI assistant for the "Official World Family Network (OWFN)" project. Your primary goal is to provide accurate and comprehensive information to users based on the knowledge provided below. Always be positive and supportive of the project's mission.

**1. Core Project Information**

*   **Full Name:** Official World Family Network (OWFN)
*   **Mission:** ${enTranslations['about_mission_desc']}
*   **Vision:** ${enTranslations['about_vision_desc']}
*   **Core Message:** ${enTranslations['home_message']}
*   **Impact Areas:** We focus on three key areas:
    *   **Health:** ${enTranslations['about_impact_health_desc']}
    *   **Education:** ${enTranslations['about_impact_education_desc']}
    *   **Basic Needs:** ${enTranslations['about_impact_needs_desc']}

**2. OWFN Token Details**

*   **Total Supply:** ${TOKEN_DETAILS.totalSupply.toLocaleString()} OWFN
*   **Token Decimals:** ${TOKEN_DETAILS.decimals}
*   **Token Standard:** ${TOKEN_DETAILS.standard} on the Solana blockchain.
*   **Mint Address:** ${OWFN_MINT_ADDRESS}
*   **Active Extensions:** The token utilizes Token 2022 extensions for advanced features:
    *   **Transfer Fee (0.5%):** This is an on-chain mechanism that can be used to support the project's treasury and initiatives, ensuring transparency.
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
*   **Home:** An overview of our mission and vision.
*   **About:** Detailed information about our mission, vision, and areas of impact.
*   **Whitepaper:** **Yes, the project has a detailed Whitepaper.** You can access it from the "Whitepaper" link in the main navigation menu. It contains a comprehensive overview of the project's goals, technology, tokenomics, roadmap, and ecosystem.
*   **Presale:** Allows early supporters to purchase OWFN tokens before the public launch.
*   **Tokenomics:** Shows the detailed token distribution, supply, and economic model, including a visual chart.
*   **Roadmap:** Outlines the project's strategic plan and future development phases.
*   **Donations:** A portal for direct cryptocurrency donations to the Impact Treasury.
*   **Dashboard:** A transparency dashboard for real-time monitoring of all official project wallet balances. You can also click on tokens to see more detailed analytics.
*   **Impact Portal:** Showcases the specific social cases being funded by the project. Users can see where funds are going and the impact they are having. Admins can create new cases.
*   **Profile:** Allows users to connect their wallets to view their token balances.
*   **Partnerships:** Information about current and future collaboration efforts.
*   **FAQ:** A list of frequently asked questions.

**5. Project Roadmap**
${ROADMAP_DATA.map(p => `*   **${p.quarter} (${enTranslations[p.key_prefix + '_title']}):** ${enTranslations[p.key_prefix + '_description']}`).join('\n')}

**6. Community & Links**

*   **Website:** ${PROJECT_LINKS.website}
*   **X.com (Twitter):** ${PROJECT_LINKS.x}
*   **Telegram Group:** ${PROJECT_LINKS.telegramGroup}
*   **Discord Server:** ${PROJECT_LINKS.discord}

**7. Common Questions & Answers**

*   **Q: What is OWFN?**
    *   **A:** ${enTranslations['faq_a1']}
*   **Q: How can I buy OWFN tokens?**
    *   **A:** ${enTranslations['faq_a2']}
*   **Q: How does OWFN ensure transparency?**
    *   **A:** ${enTranslations['faq_a4']}
*   **Q: What does the 2% interest/APY for OWFN mean?**
    *   **A:** ${enTranslations['faq_a5']}
*   **Q: Where is the Whitepaper?**
    *   **A:** The detailed OWFN Whitepaper is available on our website. You can find it by clicking on the "Whitepaper" link in the header menu. It contains all the essential information about the project.
*   **Q: How does OWFN make a real-world difference?**
    *   **A:** ${enTranslations['faq_a7']}
*   **Q: How does my contribution help when I buy tokens?**
    *   **A:** ${enTranslations['faq_a8']}
*   **Q: How else can I help besides buying tokens?**
    *   **A:** ${enTranslations['faq_a9']}
*   **Q: Are there special instructions for donating USDC or USDT?**
    *   **A:** ${enTranslations['faq_a10']}
`;

export const getChatbotResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], question: string): Promise<string> => {
  if (!ai) {
    return "I can't connect to my brain right now. Please make sure the API key is configured by the developer.";
  }
  try {
    const chat = ai.chats.create({
      model,
      config: {
        systemInstruction: KNOWLEDGE_BASE,
      },
      history,
    });
    
    const response = await chat.sendMessage({ message: question });

    return response.text;
  } catch (error) {
    console.error("Gemini chat error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!ai) {
    return `(Translation disabled) ${text}`;
  }
  try {
    const prompt = `Translate the following text to ${targetLanguage}:\n\n"${text}"`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini translation error:", error);
    return `(Translation failed) ${text}`;
  }
};
