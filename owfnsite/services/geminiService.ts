import type { ChatMessage } from '../types.ts';

export async function getChatbotResponse(
  history: ChatMessage[],
  question: string,
  langCode: string,
  onChunk: (chunk: string) => void,
  onError: (errorMsg: string) => void
): Promise<void> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, question, langCode }),
    });

    if (!response.ok || !response.body) {
      let errorMsg = `A server error occurred: ${response.status}`;
      try {
        // Attempt to read a JSON error message from the server
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) { 
        // If it's not JSON, try to read as text as a fallback
        try {
            const errorText = await response.text();
            if (errorText) errorMsg = errorText;
        } catch (textErr) { /* ignore fallback error */ }
      }
      onError(errorMsg);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      onChunk(decoder.decode(value, { stream: true }));
    }
  } catch (error) {
    console.error("Chatbot service stream error:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      onError("I can't connect to my brain right now. Please check your internet connection.");
    } else {
      onError("Sorry, I encountered a communication error. Please try again.");
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