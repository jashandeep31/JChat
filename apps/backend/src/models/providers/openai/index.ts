import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { AiModel, Attachment, ChatQuestion } from "@repo/db";
import { getAttachment } from "../../../services/attachment-cache.js";

export const askOpenAIQuestion = async (
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
      image: new URL(attachment.publicUrl),
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
        content: [...content] as any,
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
