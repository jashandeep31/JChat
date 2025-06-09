import { streamText } from "ai";
import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "process";

const googleGenerativeAI = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_GEMINI_API_KEY,
});

export const askGeminiQuestion = async (
  question: string,
  onChunk?: (chunk: string) => void
): Promise<void> => {
  const { textStream } = streamText({
    model: googleGenerativeAI("models/gemini-2.0-flash"),
    prompt: question,
  });
  for await (const textPart of textStream) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    onChunk?.(textPart);
  }
};
