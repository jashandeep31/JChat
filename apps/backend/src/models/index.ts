import { redis } from "../lib/db.js";
import { askGeminiQuestion } from "./providers/gemini/index.js";
import { askOllamaQuestion } from "./providers/ollama/index.js";
import { Server } from "socket.io";
import { AiModel, ChatQuestion } from "@repo/db";
import { db } from "../lib/db.js";
import { askOpenAIQuestion } from "./providers/openai/index.js";
import { getChatQACache } from "../services/chat-qa-cache.js";
import { getChat } from "../services/chat-cache.js";

const aiModels = await db.aiModel.findMany({
  include: {
    company: true,
  },
});

const providers: Record<string, any | undefined> = {
  ollama: askOllamaQuestion,
  google: askGeminiQuestion,
  openai: askOpenAIQuestion,
};
export const askQuestion = async (
  chatQuestion: ChatQuestion,
  modelId: string,
  io: Server,
  cid: string
): Promise<404 | { text: string; images: string }> => {
  const chat = await getChat(chatQuestion.chatId, null, true);
  const model = aiModels.find((model) => model.id === modelId);
  if (!model || !model.company) {
    throw new Error(`Model not found: ${modelId}`);
  }
  const provider: (
    question: ChatQuestion,
    model: AiModel,
    messages: { role: "user" | "system" | "assistant"; content: string }[],
    onChunk: (chunk: string) => void,
    onImageChunk: (chunk: string) => void
  ) => Promise<{ text: string; images: string }> =
    providers[model.company.slug.split("-").join("") as keyof typeof providers];

  if (!provider) {
    return 404;
  }
  const redisKey = `chat:${cid}:isStreaming`;
  await redis.set(
    redisKey,
    JSON.stringify({
      questionId: chatQuestion.id,
      data: "",
    })
  );

  const messages = await buildSystemContext(cid);
  if (chat?.instruction) {
    messages.push({
      role: "system",
      content: chat.instruction,
    });
  }
  const { text, images } = await provider(
    chatQuestion,
    model,
    messages,
    async (chunk) => {
      io.to(`room:${cid}`).emit(
        "question_response_chunk",
        JSON.stringify({ data: chunk, cid, questionId: chatQuestion.id })
      );
      await redis.set(
        redisKey,
        JSON.stringify({
          data: chunk,
          questionId: chatQuestion.id,
        })
      );
    },
    async (base64) => {
      io.to(`room:${cid}`).emit(
        "question_response_image_chunk",
        JSON.stringify({ data: base64, cid, questionId: chatQuestion.id })
      );
    }
  );

  await redis.del(redisKey);
  return { text, images };
};
async function buildSystemContext(cid: string) {
  const messages: { role: "system"; content: string }[] = [];
  const chatQA = await getChatQACache(cid);

  if (chatQA && chatQA.length) {
    for (const { question, ChatQuestionAnswer } of chatQA) {
      const lastAnswer = ChatQuestionAnswer.at(-1)?.answer ?? "";
      messages.push({
        role: "system",
        content: `User asked: "${question}"\nAI responded: "${lastAnswer}"`,
      });
    }
    messages.push({
      role: "system",
      content:
        "Use the above conversation context to answer the next question.",
    });
  }

  return messages;
}
