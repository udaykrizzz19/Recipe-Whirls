const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBb5eJSWznH2hUSvwSGT_N8m_zAcT8mWiE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiAPI {
  static async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful recipe assistant. Answer the following question about cooking, recipes, or food in a friendly and informative way. Keep responses concise but helpful: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response generated from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Fallback to a helpful response if API fails
      return "I'm having trouble connecting to my AI brain right now, but I can still help with basic recipe questions! Try asking about cooking tips, ingredient substitutions, or browse our recipe collection.";
    }
  }
}
