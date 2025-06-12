import { smoothStream, streamText } from "ai";
import { google } from "@ai-sdk/google";
import { AiModel, Attachment, ChatQuestion } from "@repo/db";
import { getAttachment } from "../../../services/attachment-cache.js";

export const askGeminiQuestion = async (
  question: ChatQuestion,
  model: AiModel,
  onChunk: (chunk: string) => void,
  onImageChunk: (chunk: string) => void
): Promise<{ text: string; images: string }> => {
  const embedAttachment = async () => {
    if (!question.attachmentId) return;

    const attachment: Attachment = await getAttachment(question.attachmentId);
    if (!attachment) return;
    return {
      type: "image",
      image: await getBase64OfImage(attachment.publicUrl),
      mimeType: "image/jpeg",
    };
  };

  const attachment = await embedAttachment();
  const content = [];
  content.push({
    type: "text",
    text: question.question,
  });
  if (attachment) {
    content.push(attachment);
  }

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
    messages: [
      {
        role: "user",
        content: [...content] as any,
      },
    ],
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

const getBase64OfImage = async (imageUrl: string) => {
  const response = await fetch(imageUrl);
  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");
  return base64ImageData;
};
