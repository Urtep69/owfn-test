import type { ChatMessage } from '../types.ts';

export async function getChatbotResponse(history: ChatMessage[], question: string, langCode: string): Promise<string> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, question, langCode }),
    });

    if (!response.ok) {
      let errorMsg = `A server error occurred: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) { /* ignore JSON parsing errors */ }
      
      if (errorMsg.includes("I can't connect")) {
         return "I can't connect to my brain right now. Please check your internet connection.";
      } else {
         return errorMsg;
      }
    }

    const data = await response.json();
    return data.text || "Sorry, I received an empty response.";

  } catch (error) {
    console.error("Chatbot service error:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return "I can't connect to my brain right now. Please check your internet connection.";
    } else {
      return "Sorry, I encountered a communication error. Please try again.";
    }
  }
}

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
     const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Translation API Error:", errorData.error);
        return `(Translation failed) ${text}`;
    }
    
    const data = await response.json();
    return data.text;
    
  } catch (error) {
    console.error("Failed to fetch translation:", error);
    return `(Translation failed) ${text}`;
  }
};
