import { generateText, smoothStream, streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { AiModel, ChatQuestion } from "@repo/db";
import { webSearch } from "../../../services/web-search.js";

export const askGroqQuestion = async (
  question: ChatQuestion,
  model: AiModel,
  messages: { role: "user" | "system" | "assistant"; content: string }[],
  onChunk: (chunk: string) => void
): Promise<{ text: string }> => {
  // Add the user question to messages
  messages.push({
    role: "user",
    content: question.question,
  });

  let text = "";

  if (question.webSearch) {
    const res = await webSearch(question.question);
    if (res) {
      messages.push({
        role: "assistant",
        content: `Here is the web search result: ${JSON.stringify(res)}`,
      });
    }
  }

  try {
    const res = streamText({
      model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
      providerOptions: {},
      messages: messages as any,
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "line",
      }),
    });

    for await (const part of res.fullStream) {
      console.log(part);
      if (part.type === "text-delta") {
        text += part.textDelta;
        onChunk(part.textDelta);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const failureMessage = `Failed to generate response: ${errorMessage}`;
    onChunk(failureMessage);
    text = failureMessage;
  }

  return { text };
};
