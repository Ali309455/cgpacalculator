export const runtime = "nodejs";

import { GoogleGenAI } from "@google/genai";

// Initialize the client. It automatically picks up process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();

    // Call the Gemini model (e.g., gemini-2.5-flash for general text tasks)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return Response.json({
      reply: response.text,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Check if the error is due to rate limits or quota exhaustion
    const isRateLimit = 
      error.status === 429 || 
      (error.message && error.message.toLowerCase().includes("quota"));

    if (isRateLimit) {
      return Response.json(
        { error: "Free plan limit exceeded. Please try again later." },
        { status: 429 } // Return a proper 429 Too Many Requests status
      );
    }
    return Response.json(
      { error: error.message || "An error occurred while generating content." },
      { status: 500 }
    );
  }
}