import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { AiModel } from "@repo/db";

export const askOpenAIQuestion = async (
  question: string,
  model: AiModel,
  onChunk: (chunk: string) => void,
  onImageChunk: (chunk: string) => void
): Promise<{ text: string; images: string }> => {
  const { fullStream } = streamText({
    model: openai(model.slug),
    providerOptions: {
      google: {
        responseModalities: [
          "TEXT",
          model.type == "IMAGE_GENERATION" ? "IMAGE" : null,
        ].filter(Boolean),
      },
    },
    prompt: question,
  });
  let text = "";
  let images = "";

  for await (const part of fullStream) {
    switch (part.type) {
      case "text-delta":
        console.log(part.textDelta);
        text += part.textDelta;
        onChunk(part.textDelta);
        break;
      case "file":
        images += part.base64;
        onImageChunk(part.base64);
        break;
    }
  }

  return { text, images };
};
