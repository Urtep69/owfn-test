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
  // If there's no text to translate, return immediately to avoid API calls.
  if (!text || !text.trim()) {
      return text;
  }
  
  try {
     const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
        // Log the error but fall back gracefully to the original text.
        // The server-side function also has fallbacks, so this handles network/HTTP errors.
        console.error(`Translation API request failed with status ${response.status}`);
        return text;
    }
    
    const data = await response.json();
    // If the response text is empty or null, return original text.
    return data.text || text;
    
  } catch (error) {
    // On fetch errors (e.g., network issues), log the error and return the original text.
    // This provides a better user experience than showing a failed state.
    console.error("Failed to fetch translation:", error);
    return text;
  }
};