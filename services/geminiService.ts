
import { GoogleGenAI } from "@google/genai";

// Create a new instance right before the call to ensure the latest API key is used
export const getShoppingAdvice = async (userMessage: string, context: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User is shopping on Fashion Dhara. Current luxury catalog focus: ${context}. User asks: ${userMessage}`,
      config: {
        systemInstruction: "You are Dhara, a world-class luxury fashion stylist and shopping assistant for Fashion Dhara boutique. Your tone is sophisticated, premium, and helpful. You recommend high-quality pieces that elevate the user's lifestyle. Focus on elegance and exclusivity.",
        temperature: 0.7,
      },
    });
    return response.text || "I apologize, my stylistic processing is currently unavailable.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I am experiencing difficulty connecting to our fashion network.";
  }
};

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a sophisticated, 2-sentence luxury marketing description for a boutique product named "${productName}" in the "${category}" category. Use words like exquisite, premium, and artisanal.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return "An exquisite addition to your exclusive collection.";
  }
};
