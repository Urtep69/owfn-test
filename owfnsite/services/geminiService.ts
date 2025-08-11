
export const getChatbotResponse = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], question: string, langCode: string): Promise<string> => {
  try {
    const response = await fetch('/api/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, question, langCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData.error);
      return "Sorry, I encountered an error. Please try again.";
    }

    const data = await response.json();
    return data.text;

  } catch (error) {
    console.error("Failed to fetch chatbot response:", error);
    // Check if the error is due to a network issue, which could happen if the user is offline.
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
       return "I can't connect to my brain right now. Please check your internet connection.";
    }
    return "Sorry, I encountered a communication error. Please try again.";
  }
};

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
