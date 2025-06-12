import { smoothStream, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { AiModel } from "@repo/db";

export const askGeminiQuestion = async (
  question: string,
  model: AiModel,
  onChunk: (chunk: string) => void,
  onImageChunk: (chunk: string) => void
): Promise<{ text: string; images: string }> => {
  const { fullStream } = streamText({
    model: google(model.slug),
    providerOptions: {
      google: {
        responseModalities: [
          "TEXT",
          model.type == "IMAGE_GENERATION" ? "IMAGE" : null,
        ].filter(Boolean),
      },
    },
    prompt: question,
    experimental_transform: smoothStream({
      delayInMs: 20, // optional: defaults to 10ms
      chunking: "line", // optional: defaults to 'word'
    }),
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
