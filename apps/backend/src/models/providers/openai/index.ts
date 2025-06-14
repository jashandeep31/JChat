import { AiModel, Attachment, ChatQuestion } from "@repo/db";
import OpenAI from "openai";
import { env } from "../../../lib/env.js";
import { getAttachment } from "../../../services/attachment-cache.js";

const openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });

type OpenAITextContent = {
  type: "text";
  text: string;
};

type OpenAIImageContent = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

type OpenAIContentItem = OpenAITextContent | OpenAIImageContent;

export const askOpenAIQuestion = async (
  question: ChatQuestion,
  model: AiModel,
  messages: {
    role: "user" | "system" | "assistant" | "tool";
    content: string;
  }[],
  onChunk: (chunk: string) => void
): Promise<{ text: string; images: string }> => {
  try {
    let text = "";
    let attachment: Attachment | null = null;

    if (question.attachmentId) {
      attachment = await getAttachment(question.attachmentId);
    }

    const messageContent: OpenAIContentItem[] = [
      {
        type: "text",
        text: question.question,
      },
    ];

    if (attachment && attachment.type === "IMAGE") {
      messageContent.push({
        type: "image_url",
        image_url: {
          url: attachment.publicUrl,
        },
      });
    }

    const stream = await openaiClient.chat.completions.create({
      model: model.slug,
      messages: [
        ...(messages as any),
        {
          role: "user",
          content: messageContent,
        },
      ],
      stream: true,
    });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        text += content;
        onChunk(content);
      }
    }

    return { text, images: "" };
  } catch (error) {
    console.error("OpenAI error:", error);
    return { text: "Error in OpenAI stream", images: "" };
  }
};
