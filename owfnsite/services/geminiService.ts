import type { ChatMessage } from '../types.ts';

// This is the new "ultramodern" service function that understands the JSON stream protocol.
export async function getChatbotResponse(
  history: ChatMessage[],
  question: string,
  langCode: string,
  currentTime: string,
  onChunk: (chunk: string) => void,
  onError: (errorMsg: string) => void
): Promise<void> {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, question, langCode, currentTime }),
    });

    if (!response.ok || !response.body) {
      let errorMsg = `A server error occurred: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
         try {
            const errorText = await response.text();
            if (errorText) errorMsg = errorText;
        } catch (textErr) { /* ignore */ }
      }
      onError(errorMsg);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const processLine = (line: string) => {
        if (line.trim() === '') return; // Skip empty lines
        try {
          const parsed = JSON.parse(line);

          switch(parsed.type) {
            case 'chunk':
              onChunk(parsed.data);
              break;
            case 'error':
              console.error('Chatbot stream error from server:', parsed.data);
              onError(parsed.data);
              return false; // Stop processing
            case 'end':
              return false; // Graceful end of stream
            default:
              console.warn('Received unknown message type from chatbot stream:', parsed.type);
          }
        } catch (e) {
          console.error("Failed to parse chatbot stream JSON object:", line, e);
        }
        return true; // Continue processing
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        processLine(buffer);
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; 
      
      for (const line of lines) {
        if (!processLine(line)) {
            return;
        }
      }
    }
  } catch (error) {
    console.error("Chatbot service fetch error:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      onError("I can't connect to my brain right now. Please check your internet connection.");
    } else {
      onError("Sorry, I encountered a communication error. Please try again.");
    }
  }
}


export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text || !text.trim()) {
      return text;
  }
  
  try {
     const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Translation API request failed with status ${response.status}`, errorData);
        return text; // Graceful fallback to original text
    }
    
    const data = await response.json();
    return data.translatedText || text; // Use translatedText key and fallback
    
  } catch (error) {
    console.error("Failed to fetch translation:", error);
    return text; // Graceful fallback
  }
};
