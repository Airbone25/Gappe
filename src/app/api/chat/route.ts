import { GoogleGenAI } from "@google/genai";
import PERSONAS from "../personas/personas";
import { NextResponse } from "next/server";
import { Message } from "@/types/Bot";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message, botId, chatHistory = [] } = await req.json();

    const systemMessage = {
      role: "model",
      parts: [{ text: PERSONAS.find(p => p.id == botId)?.persona }],
    };

    const historyMessages = (chatHistory as Message[]).map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));


    const contents = [
      systemMessage,
      ...historyMessages,
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const reply = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Gemini" },
      { status: 500 }
    );
  }
}