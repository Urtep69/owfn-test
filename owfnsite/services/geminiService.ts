import type { ChatMessage } from '../types.ts';

export async function* streamChatbotResponse(history: ChatMessage[], question: string, langCode: string): AsyncGenerator<string, void, undefined> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, question, langCode, stream: true }),
    });

    if (!response.ok || !response.body) {
      let errorMsg = `A server error occurred: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) { /* ignore JSON parsing errors */ }
      
      // Instead of throwing, we yield the error message to be displayed in the chat.
      if (errorMsg.includes("I can't connect")) {
         yield "I can't connect to my brain right now. Please check your internet connection.";
      } else {
         yield errorMsg;
      }
      return; // Stop the generator
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  } catch (error) {
    console.error("Chatbot streaming service error:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      yield "I can't connect to my brain right now. Please check your internet connection.";
    } else {
      yield "Sorry, I encountered a communication error. Please try again.";
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