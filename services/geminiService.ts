import { GoogleGenAI, Type } from "@google/genai";

// Ensure API key is present
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface GeneratedCardData {
  front: string;
  back: string;
}

export const generateCardsFromTopic = async (topic: string, count: number = 5, instructions?: string): Promise<GeneratedCardData[]> => {
  if (!API_KEY) {
    console.error("API Key is missing");
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create ${count} flashcards for studying the topic: "${topic}". 
      The 'front' should be a question, term, or concept. 
      The 'back' should be the answer, definition, or explanation.
      Make them suitable for spaced repetition learning (concise and clear).
      
      ${instructions ? `IMPORTANT - Follow these specific user instructions: "${instructions}"` : ''}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ["front", "back"],
            propertyOrdering: ["front", "back"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text) as GeneratedCardData[];
    return data;

  } catch (error) {
    console.error("Error generating cards:", error);
    throw error;
  }
};

export const generateCardsFromText = async (textContext: string, count: number = 5, instructions?: string): Promise<GeneratedCardData[]> => {
  if (!API_KEY) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract key concepts from the following text and convert them into flashcards.
      Create exactly ${count} cards if possible.
      
      ${instructions ? `User Instructions for extraction style/focus: "${instructions}"` : ''}
      
      Text:
      "${textContext.substring(0, 5000)}" 
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "The term or question" },
              back: { type: Type.STRING, description: "The definition or answer" }
            },
            required: ["front", "back"]
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as GeneratedCardData[];
  } catch (error) {
    console.error("Error generating from text:", error);
    throw error;
  }
};

export const generateQuizFromWords = async (words: string, instructions?: string): Promise<GeneratedCardData[]> => {
  if (!API_KEY) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have a list of words. Please create a flashcard for each word.
      
      Default Instructions:
      1. 'Front': The word itself.
      2. 'Back': A clear definition, synonym, or explanation of the word. You can also include an example sentence in parentheses.
      
      ${instructions ? `Additional User Instructions (Override default if conflicting): "${instructions}"` : ''}
      
      Words:
      "${words}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "The word" },
              back: { type: Type.STRING, description: "The definition/answer" }
            },
            required: ["front", "back"]
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as GeneratedCardData[];
  } catch (error) {
    console.error("Error generating quiz from words:", error);
    throw error;
  }
};