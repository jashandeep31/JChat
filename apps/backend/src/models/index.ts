import { redis } from "../lib/db.js";
import { askGeminiQuestion } from "./providers/gemini/index.js";
import { askOllamaQuestion } from "./providers/ollama/index.js";
import { Server } from "socket.io";
import { AiModel, ChatQuestion } from "@repo/db";
import { db } from "../lib/db.js";
import { askOpenAIQuestion } from "./providers/openai/index.js";
import { getChatQACache } from "../services/chat-qa-cache.js";
import { getChat } from "../services/chat-cache.js";
import { askGroqQuestion } from "./providers/groq/index.js";
import { getProject } from "../services/project-cache.js";
import { getApi } from "../services/api-cache.js";
import { askAnthropicQuestion } from "./providers/anthropic/index.js";

export interface ProviderFunctionParams {
  question: ChatQuestion;
  model: AiModel;
  apiKey: string | null;
  messages: { role: "user" | "system" | "assistant"; content: string }[];
  onChunk: (chunk: string) => void;
  onImageChunk: (chunk: string) => void;
  onWebSearchChunk: (chunk: { title: string; url: string }[]) => void;
  onReasoningChunk: (chunk: string) => void;
}

export type ProviderResponse = {
  text: string;
  images: string;
  reasoning: string;
  webSearches: { title: string; url: string }[];
};

const aiModels = await db.aiModel.findMany({
  include: {
    company: true,
  },
});

const providers: Record<string, any | undefined> = {
  ollama: askOllamaQuestion,
  google: askGeminiQuestion,
  openai: askOpenAIQuestion,
  groq: askGroqQuestion,
  anthropic: askAnthropicQuestion,
};
export const askQuestion = async (
  chatQuestion: ChatQuestion,
  modelId: string,
  io: Server,
  cid: string
): Promise<404 | ProviderResponse> => {
  const chat = await getChat(chatQuestion.chatId, null, true);
  if (!chat) {
    throw new Error(`Chat not found: ${chatQuestion.chatId}`);
  }
  const model = aiModels.find((model) => model.id === modelId);
  if (!model || !model.company) {
    throw new Error(`Model not found: ${modelId}`);
  }
  const provider: (params: ProviderFunctionParams) => Promise<{
    text: string;
    images: string;
    reasoning: string;
    webSearches: { title: string; url: string }[];
  }> =
    providers[model.company.slug.split("-").join("") as keyof typeof providers];
  if (!provider) {
    return 404;
  }
  const redisKey = `chat:${cid}:isStreaming`;
  await redis.set(
    redisKey,
    JSON.stringify({
      questionId: chatQuestion.id,

      data: {
        text: "",
        images: "",
        reasoning: "",
        webSearches: [],
      },
    })
  );

  const messages = await buildSystemContext(cid);
  if (chat?.projectId) {
    const project = await getProject(chat.projectId);
    if (project?.instruction) {
      messages.push({
        role: "system",
        content: project.instruction,
      });
    }
  }
  if (chat?.instruction) {
    messages.push({
      role: "system",
      content: chat.instruction,
    });
  }
  const apiKey = (await getApi(model.companyId, chat?.userId))?.key || null;

  const resultStore: ProviderResponse = {
    text: "",
    images: "",
    reasoning: "",
    webSearches: [],
  };
  const emitUpdate = async () => {
    io.to(`room:${cid}`).emit(
      "question_response_chunk",
      JSON.stringify({
        data: {
          text: resultStore.text,
          images: resultStore.images,
          reasoning: resultStore.reasoning,
          webSearches: resultStore.webSearches,
        },
        questionId: chatQuestion.id,
      })
    );
    await redis.set(
      redisKey,
      JSON.stringify({
        data: {
          text: resultStore.text,
          images: resultStore.images,
          reasoning: resultStore.reasoning,
          webSearches: resultStore.webSearches,
        },
        questionId: chatQuestion.id,
      })
    );
  };

  const { text, images, webSearches, reasoning } = await provider({
    question: chatQuestion,
    apiKey,
    model,
    messages,
    onChunk: async (chunk) => {
      resultStore.text += chunk;
      await emitUpdate();
    },
    onImageChunk: async (base64) => {
      resultStore.images += base64;
      await emitUpdate();
    },
    onWebSearchChunk: async (webSearches: { title: string; url: string }[]) => {
      resultStore.webSearches = webSearches;
      await emitUpdate();
    },
    onReasoningChunk: async (reasoning) => {
      resultStore.reasoning += reasoning;
      await emitUpdate();
    },
  });

  await redis.del(redisKey);
  return { text, images, webSearches, reasoning };
};
async function buildSystemContext(cid: string) {
  const messages: { role: "system"; content: string }[] = [];
  const chatQA = await getChatQACache(cid);

  if (chatQA && chatQA.length > 0) {
    for (const { question, ChatQuestionAnswer } of chatQA) {
      const lastAnswer = ChatQuestionAnswer.at(-1)?.answer ?? "";
      if (lastAnswer.length > 2) {
        messages.push({
          role: "system",
          content: `User asked: "${question}"\nAI responded: "${lastAnswer}"`,
        });
      }
    }
    if (messages.length > 0) {
      messages.push({
        role: "system",
        content:
          "Use the above conversation context to answer the next question.",
      });
    }
  }

  return messages;
}
