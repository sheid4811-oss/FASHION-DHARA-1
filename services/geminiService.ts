
import { GoogleGenAI } from "@google/genai";

// Create a new instance right before the call to ensure the latest API key is used
export const getShoppingAdvice = async (userMessage: string, context: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is shopping on NovaShop. Current catalog focus: ${context}. User asks: ${userMessage}`,
      config: {
        systemInstruction: "You are Nova, an expert shopping assistant for NovaShop. Be helpful, concise, and professional. Suggest specific products if they match the user's needs.",
        temperature: 0.7,
      },
    });
    return response.text || "I'm sorry, I couldn't process that right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI assistant.";
  }
};

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a compelling, 2-sentence marketing description for a product named "${productName}" in the "${category}" category.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return "Amazing new product!";
  }
};
