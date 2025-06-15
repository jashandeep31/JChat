import { AiModel, Attachment, ChatQuestion } from "@repo/db";
import OpenAI from "openai";
import type { ChatCompletionTool } from "openai/resources/chat";
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
}: ProviderFunctionParams): Promise<ProviderResponse> => {
  try {
    const openaiClient = new OpenAI({ apiKey: apiKey || env.OPENAI_API_KEY });

    let text = "";
    let attachment: Attachment | null = null;
    let webSearches: { title: string; url: string }[] = [];

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
              type: "file",
              file: {
                file_id: file.id,
              },
            } as any);
          } else {
          }
        } catch (error) {}
      }
    }

    const tools: ChatCompletionTool[] = [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for current information",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query",
              },
            },
            required: ["query"],
          },
        },
      },
    ];
    const finalMessages = [
      ...(messages as any),
      {
        role: "system",
        content:
          "You are a helpful assistant. If the user asks about current events or information that might be outdated in your knowledge, use the web_search tool to find the most up-to-date information.",
      },
      {
        role: "user",
        content: messageContent,
      },
    ];

    const needsWebSearch =
      /news|current|latest|recent|today|weather|stock|price|score|date|time|event|update|trend/i.test(
        question.question
      );

    let searchResults = [];
    if (needsWebSearch && question.webSearch) {
      try {
        searchResults = await webSearch(question.question);
        if (searchResults.length > 0) {
          const formattedResults = searchResults
            .map(
              (result) =>
                `Title: ${result.title}\nURL: ${result.link}\nSummary: ${result.snippet}`
            )
            .join("\n\n");

          searchResults.map((result) => {
            webSearches.push({
              title: result.title,
              url: result.link,
            });
          });
          onWebSearchChunk(webSearches);
          const toolCallId = "search_" + Date.now();
          finalMessages.push({
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: toolCallId,
                type: "function",
                function: {
                  name: "web_search",
                  arguments: JSON.stringify({ query: question.question }),
                },
              },
            ],
          });

          finalMessages.push({
            role: "tool",
            tool_call_id: toolCallId,
            content: formattedResults || "No results found",
          });
        }
      } catch (error) {
        console.error("Error during web search:", error);
      }
    }

    const stream = await openaiClient.chat.completions.create({
      model: model.slug,
      messages: [...finalMessages],
      tools: needsWebSearch && question.webSearch ? tools : undefined,
      stream: true,
    });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        text += content;
        onChunk(content);
      }
    }

    return { text, images: "", webSearches };
  } catch (error) {
    console.error("OpenAI error:", error);
    return { text: "Error in OpenAI stream", images: "", webSearches: [] };
  }
};
