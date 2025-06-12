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
    messages: [
      {
        role: "user",
        content: [
          {
            /* the image part */
            type: "image",
            image: new URL(
              "https://www.wikihow.com/images/thumb/1/15/Write-a-Bill-for-Payment-Step-1-Version-4.jpg/aid1418272-v4-728px-Write-a-Bill-for-Payment-Step-1-Version-4.jpg.webp"
            ),
            mimeType: "image/jpeg", // be explicit
          },
          {
            /* the actual question */
            type: "text",
            text: question,
          },
        ],
      },
    ],
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
