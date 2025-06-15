import { smoothStream, streamText } from "ai";
import { Attachment } from "@repo/db";
import { getAttachment } from "../../../services/attachment-cache.js";
import { getBase64OfImage } from "../../utils/converters.js";
import { ProviderFunctionParams } from "../../index.js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { env } from "../../../lib/env.js";

type ContentItem =
  | { type: "text"; text: string }
  | { type: "image"; image: string; mimeType: string };

export const askGeminiQuestion = async ({
  question,
  model,
  apiKey,
  messages,
  onChunk,
  onImageChunk,
}: ProviderFunctionParams): Promise<{ text: string; images: string }> => {
  const google = createGoogleGenerativeAI({
    apiKey: apiKey || env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  if (model.type === "IMAGE_GENERATION") {
    messages = [];
  }
  const userContent: ContentItem[] = [
    { type: "text", text: question.question },
  ];
  if (question.attachmentId) {
    try {
      const attachment: Attachment | null = await getAttachment(
        question.attachmentId
      );
      if (attachment && attachment.type === "IMAGE") {
        const base64Image = await getBase64OfImage(attachment.publicUrl);
        userContent.push({
          type: "image",
          image: base64Image,
          mimeType: "image/jpeg",
        });
      }
    } catch {}
  }

  if (userContent.length) {
    messages.push({
      role: "user",
      content: userContent as any,
    });
  }
  const modelOptions =
    model.webAnalysis && question.webSearch
      ? { useSearchGrounding: true }
      : undefined;

  const providerOptions = {
    google: {
      responseModalities: [
        "TEXT",
        model.type === "IMAGE_GENERATION" ? "IMAGE" : null,
      ].filter(Boolean),
    },
  };

  let text = "";
  let images = "";

  try {
    const { fullStream } = streamText({
      model: google(model.slug, { ...modelOptions }),
      providerOptions,
      messages: messages as any,
      experimental_transform: smoothStream({
        delayInMs: 20,
        chunking: "line",
      }),
    });

    for await (const part of fullStream) {
      switch (part.type) {
        case "text-delta":
          text += part.textDelta;
          onChunk(part.textDelta);
          break;
        case "file":
          images += part.base64;
          onImageChunk(part.base64);
          break;
        case "source":
          console.log(part.source);
          break;
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const failureMessage = `Failed to generate response: ${errorMessage}`;
    onChunk(failureMessage);
    text = failureMessage;
  }

  return { text, images };
};
