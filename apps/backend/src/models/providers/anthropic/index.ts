import { ProviderFunctionParams } from "../../index.js";
import { env } from "../../../lib/env.js";
import Anthropic from "@anthropic-ai/sdk";
import { getAttachment } from "../../../services/attachment-cache.js";
import {
  ContentBlockParam,
  MessageParam,
} from "@anthropic-ai/sdk/resources/messages.mjs";
export const askAnthropicQuestion = async ({
  question,
  model,
  apiKey,
  messages,
  onChunk,
  onWebSearchChunk,
  onReasoningChunk,
}: ProviderFunctionParams) => {
  try {
    let text = "";
    let reasoning = "";
    let webSearches: { title: string; url: string }[] = [];

    const anthropic = new Anthropic({
      apiKey: apiKey || env.ANTHROPIC_API_KEY,
    });

    let content: ContentBlockParam[] = [];
    if (question.attachmentId) {
      const attachment = await getAttachment(question.attachmentId);
      if (attachment && attachment.type === "IMAGE") {
        content.push({
          type: "image",
          source: {
            type: "url",
            url: attachment.publicUrl,
          },
        });
      } else if (attachment && attachment.type === "PDF") {
        content.push({
          type: "document",
          source: {
            type: "url",
            url: attachment.publicUrl,
          },
        });
      }
    }
    content.push({
      type: "text",
      text: question.question,
    });
    messages.push({
      role: "user",
      content: content as any,
    });
    const filteredMessages: MessageParam[] = messages.reduce((acc, message) => {
      if (message.role === "user" || message.role === "assistant") {
        acc.push(message as MessageParam);
      } else if (message.role === "system") {
        acc.push({
          role: "assistant",
          content: message.content,
        });
      }
      return acc;
    }, [] as MessageParam[]);

    const res = await anthropic.messages.create({
      messages: filteredMessages,
      model: model.slug,
      max_tokens: 15000,
      stream: true,
      ...(model.reasoning
        ? {
            thinking: {
              type: "enabled",
              budget_tokens: 10000,
            },
          }
        : {}),
      tools: question.webSearch
        ? [
            {
              type: "web_search_20250305",
              name: "web_search",
              max_uses: 2,
            } as any,
          ]
        : [],
    });

    for await (const chunk of res) {
      if (chunk.type === "content_block_delta") {
        const delta_type = chunk.delta.type;
        if (delta_type === "text_delta") {
          text += chunk.delta.text;
          onChunk(chunk.delta.text);
        } else if (delta_type === "thinking_delta") {
          reasoning += chunk.delta.thinking;
          onReasoningChunk(chunk.delta.thinking);
        }
        if (delta_type === "citations_delta") {
          const citationData = chunk.delta.citation;
          if (citationData.type === "web_search_result_location") {
            if (citationData.title && citationData.url) {
              webSearches.push({
                title: citationData.title,
                url: citationData.url,
              });
              onWebSearchChunk(webSearches);
            }
          }
        }
      }
    }

    return { text, images: "", webSearches, reasoning };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const failureMessage = `Failed to generate response: ${errorMessage}`;
    onChunk(failureMessage);
    return { text: failureMessage, images: "", webSearches: [], reasoning: "" };
  }
};
