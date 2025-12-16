import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const geminiService = {
  /**
   * Enhances raw notes into structured, professional feedback with examples.
   */
  enhanceNote: async (rawContent: string, studentLevel: string): Promise<string> => {
    if (!apiKey) {
        console.warn("No API Key provided for Gemini.");
        return rawContent;
    }

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        You are an expert English teacher assistant.
        Refine the following class notes for a student at level ${studentLevel}.
        
        Goals:
        1. Correct any grammar mistakes in the note itself.
        2. Organize it with clear bullet points.
        3. Add 2-3 practical examples for the concepts mentioned.
        4. Add a friendly, encouraging closing.
        
        Raw Notes:
        "${rawContent}"
        
        Output format: Plain text (Markdown allowed).
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      return response.text || rawContent;
    } catch (error) {
      console.error("Gemini enhancement failed:", error);
      return rawContent; // Fallback to original content
    }
  },

  /**
   * Suggests practice questions based on the note content.
   */
  generatePracticeQuestions: async (noteContent: string): Promise<string> => {
      if (!apiKey) return "";

      try {
        const model = 'gemini-2.5-flash';
        const prompt = `
          Based on these class notes, generate 3 short practice questions (fill-in-the-blank or multiple choice) for the student to test their understanding.
          
          Notes: "${noteContent}"
          
          Output: Just the questions.
        `;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt
        });
        
        return response.text || "";
      } catch (error) {
          console.error("Gemini question generation failed", error);
          return "";
      }
  }
};
