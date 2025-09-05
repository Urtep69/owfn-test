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