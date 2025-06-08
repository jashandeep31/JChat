import { askOllamaQuestion } from "./providers/ollama/index.js";
import { ModelProvider } from "./types.js";
import { Socket } from "socket.io";

const providers: Record<ModelProvider, any | undefined> = {
  ollama: askOllamaQuestion,
  openai: undefined,
  anthropic: undefined,
};

export const askQuestion = async (
  question: string,
  modelId: ModelProvider,
  socket: Socket
): Promise<any> => {
  const provider = providers[modelId];
  if (!provider) {
    throw new Error(`Unsupported or unimplemented model provider: ${modelId}`);
  }
  let answer = "";
  await provider(question, (chunk: string) => {
    socket.emit("question_response_chunk", chunk);
    answer += chunk;
  });
  return answer;
};
