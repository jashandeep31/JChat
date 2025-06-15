import { Attachment } from "@repo/db";
import OpenAI from "openai";
import { env } from "../../../lib/env.js";
import { getAttachment } from "../../../services/attachment-cache.js";
import { webSearch } from "../../../services/web-search.js";
import { ProviderFunctionParams, ProviderResponse } from "../../index.js";

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

type OpenAIInputFileContent = {
  type: "input_file";
  file_id: string;
};
type OpenAIContentItem =
  | OpenAITextContent
  | OpenAIImageContent
  | OpenAIInputFileContent;

export const askOpenAIQuestion = async ({
  question,
  apiKey,
  model,
  messages,
  onChunk,
  onWebSearchChunk,
  onReasoningChunk,
}: ProviderFunctionParams): Promise<ProviderResponse> => {
  try {
    const openaiClient = new OpenAI({ apiKey: apiKey || env.OPENAI_API_KEY });
    let reasoning = "";
    let text = "";
    let attachment: Attachment | null = null;
    let webSearches: { title: string; url: string }[] = [];

    if (question.attachmentId) {
      attachment = await getAttachment(question.attachmentId);
    }

    const messageContent: any[] = [
      {
        type: "input_text",
        text: question.question,
      },
    ];

    if (attachment && attachment.type === "IMAGE") {
      messageContent.push({
        type: "input_image",
        image_url: attachment.publicUrl,
      });
    }
    if (attachment && attachment.type === "PDF") {
      const response = await fetch(attachment.publicUrl);
      if (response.ok) {
        try {
          const file = await openaiClient.files.create({
            file: response,
            purpose: "user_data",
          });
          if (file) {
            messageContent.push({
              type: "input_file",
              file_id: file.id,
            } as any);
          } else {
          }
        } catch (error) {}
      }
    }

    const finalMessages = [
      ...(messages as any),
      {
        role: "user",
        content: messageContent,
      },
    ];

    const respStream = await openaiClient.responses.create({
      model: model.slug,
      input: finalMessages,
      ...(model.reasoning
        ? { reasoning: { effort: "medium", summary: "detailed" } }
        : {}),
      stream: true,
      tools: question.webSearch ? [{ type: "web_search_preview" }] : [],
    });
    for await (const chunk of respStream) {
      console.log(JSON.stringify(chunk));
      if (chunk.type === "response.reasoning_summary_text.delta") {
        reasoning += chunk.delta;
        onReasoningChunk(chunk.delta as string);
        continue;
      }
      if (chunk.type === "response.output_text.delta") {
        text += chunk.delta;
        onChunk(chunk.delta as string);
        continue;
      }
    }
    return { text, images: "", webSearches, reasoning };
  } catch (error) {
    console.error("OpenAI error:", error);
    return {
      text: "Error in OpenAI stream",
      images: "",
      webSearches: [],
      reasoning: "",
    };
  }
};
