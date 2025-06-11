import { redis } from "../lib/db.js";
import { askGeminiQuestion } from "./providers/gemini/index.js";
import { askOllamaQuestion } from "./providers/ollama/index.js";
import { Server } from "socket.io";
import { ChatQuestion } from "@repo/db";
import { db } from "../lib/db.js";

const aiModels = await db.aiModel.findMany({
  include: {
    company: true,
  },
});

const providers: Record<string, any | undefined> = {
  ollama: askOllamaQuestion,
  google: askGeminiQuestion,
};
export const askQuestion = async (
  chatQuestion: ChatQuestion,
  modelId: string,
  io: Server,
  cid: string
): Promise<any> => {
  const model = aiModels.find((model) => model.id === modelId);
  if (!model || !model.company) {
    throw new Error(`Model not found: ${modelId}`);
  }
  const provider: (
    question: string,
    model: string,
    onChunk?: (chunk: string) => void
  ) => Promise<void> = providers[model.company.slug as keyof typeof providers];

  if (!provider) {
    throw new Error(`Unsupported or unimplemented model provider: ${modelId}`);
  }
  let answer = "";
  const redisKey = `chat:${cid}:isStreaming`;
  await provider(chatQuestion.question, model.slug, async (chunk: string) => {
    io.to(`room:${cid}`).emit(
      "question_response_chunk",
      JSON.stringify({ data: chunk, cid, questionId: chatQuestion.id })
    );
    answer += chunk;
    await redis.set(redisKey, answer);
  });
  await redis.del(redisKey);
  return answer;
};
