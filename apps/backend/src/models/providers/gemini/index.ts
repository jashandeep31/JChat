import { smoothStream, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { AiModel, Attachment, ChatQuestion } from "@repo/db";
import { getAttachment } from "../../../services/attachment-cache.js";
import { getBase64OfImage } from "../../utils/converters.js";

type ContentItem =
  | { type: "text"; text: string }
  | { type: "image"; image: string; mimeType: string };

export const askGeminiQuestion = async (
  question: ChatQuestion,
  model: AiModel,
  messages: { role: "user" | "system" | "assistant"; content: string }[],
  onChunk: (chunk: string) => void,
  onImageChunk: (chunk: string) => void
): Promise<{ text: string; images: string }> => {
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
    } catch (error) {
      console.error("Failed to process attachment:", error);
      // Continue with text-only query if attachment processing fails
    }
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
      model: google(model.slug, modelOptions),
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
