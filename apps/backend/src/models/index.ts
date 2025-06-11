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
): Promise<404 | string> => {
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
    return 404;
  }
  let answer = "";
  if (1 !== 1) {
    // a long fake response (~300 words) with narrative + sample React component
    const fakeResponse = `Here’s a demonstration of a hypothetical React component named SampleComponent. It imports React from the 'react' package and uses the useState hook to manage an internal count state, with an initial value of zero. A button triggers an increment function when clicked, updating the state and re-rendering the component with the new count displayed. We also show how props can be passed in for additional flexibility. Below is a simple React component example:
  
  import React, { useState } from 'react';
  
  const SampleComponent = ({ initialCount = 0 }) => {
    const [count, setCount] = useState(initialCount);
    const increment = () => setCount(prev => prev + 1);
  
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
        <h1>Count: {count}</h1>
        <button onClick={increment}>Increment</button>
      </div>
    );
  };
  
  export default SampleComponent;
  
  This code snippet demonstrates state management, event handling, and functional component syntax. After the component definition, we export it so it can be imported elsewhere. This concludes the code demonstration. In addition, this fake stream includes commentary interleaved with code. It simulates chunked streaming over a WebSocket connection: each chunk represents part of the narrative or code. Small delays between chunks mimic real AI streaming behavior. Accumulating the chunks reconstructs the full response before returning it. This approach lets front-end UIs render partial responses as they arrive, improving perceived performance. You can customize chunk sizes, tweak delays, or include simulated logs of network calls, errors, or warnings. By combining narrative text and code, the stream feels realistic and supports both conceptual explanations and practical implementation. Ultimately, this stub serves as a reliable placeholder until real streaming responses are available.`;

    // split into ~100-char chunks
    const fakeChunks = fakeResponse.match(/.{1,100}/g) || [];

    const redisKey = `chat:${cid}:isStreaming`;
    let answer = "";
    for (const chunk of fakeChunks) {
      io.to(`room:${cid}`).emit(
        "question_response_chunk",
        JSON.stringify({ data: chunk, cid, questionId: chatQuestion.id })
      );
      answer += chunk;
      await redis.set(redisKey, answer);
      await new Promise((res) => setTimeout(res, 200));
    }
    await redis.del(redisKey);
    return answer;
  } else {
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
  }
};
