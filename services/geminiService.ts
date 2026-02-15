
import { GoogleGenAI } from "@google/genai";

export const getShoppingAdvice = async (userMessage: string, context: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro for better fashion reasoning
      contents: `User is shopping on Fashion Dhara. Current luxury catalog focus: ${context}. User asks: ${userMessage}`,
      config: {
        systemInstruction: "You are Dhara, a world-class luxury fashion stylist and shopping assistant for Fashion Dhara boutique. Your tone is sophisticated, premium, and helpful. You recommend high-quality pieces that elevate the user's lifestyle. If the user asks about general fashion trends or news, use your search capabilities to find the latest high-fashion news. Focus on elegance and exclusivity.",
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      },
    });
    
    const text = response.text || "I apologize, my stylistic processing is currently unavailable.";
    // Extract search grounding URLs as required by the guidelines
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: "I am experiencing difficulty connecting to our fashion network.", 
      sources: [] 
    };
  }
};

export const generateProductDescription = async (productName: string, category: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a sophisticated, 2-sentence luxury marketing description for a boutique product named "${productName}" in the "${category}" category. Use words like exquisite, premium, and artisanal.`,
    });
    // Correctly accessing text property without calling it as a method
    return response.text || "";
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return "An exquisite addition to your exclusive collection.";
  }
};
