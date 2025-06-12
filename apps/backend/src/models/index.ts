import { redis } from "../lib/db.js";
import { askGeminiQuestion } from "./providers/gemini/index.js";
import { askOllamaQuestion } from "./providers/ollama/index.js";
import { Server } from "socket.io";
import { AiModel, ChatQuestion } from "@repo/db";
import { db } from "../lib/db.js";
import { askOpenAIQuestion } from "./providers/openai/index.js";

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
  const model = aiModels.find((model) => model.id === modelId);
  if (!model || !model.company) {
    throw new Error(`Model not found: ${modelId}`);
  }
  const provider: (
    question: string,
    model: AiModel,
    onChunk: (chunk: string) => void,
    onImageChunk: (chunk: string) => void
  ) => Promise<{ text: string; images: string }> =
    providers[model.company.slug.split("-").join("") as keyof typeof providers];

  if (!provider) {
    return 404;
  }
  const redisKey = `chat:${cid}:isStreaming`;
  const { text, images } = await provider(
    chatQuestion.question,
    model,
    async (chunk) => {
      io.to(`room:${cid}`).emit(
        "question_response_chunk",
        JSON.stringify({ data: chunk, cid, questionId: chatQuestion.id })
      );
      await redis.set(redisKey, chunk);
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
