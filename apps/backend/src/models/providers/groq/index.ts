import { generateText, smoothStream, streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { AiModel, ChatQuestion } from "@repo/db";
import { webSearch } from "../../../services/web-search.js";
import { ProviderFunctionParams } from "../../index.js";

export const askGroqQuestion = async ({
  question,
  model,
  messages,
  onChunk,
}: ProviderFunctionParams): Promise<{ text: string }> => {
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
      model: groq(model.slug),
      providerOptions: {},
      messages: messages as any,
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "line",
      }),
    });

    for await (const part of res.fullStream) {
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
