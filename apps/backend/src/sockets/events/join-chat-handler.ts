import { getChat } from "../../services/chat-cache.js";
import { db, redis } from "../../lib/db.js";
import { SocketFunctionParams } from "../../models/types.js";

export const joinChatHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  const cid = data;
  const chatPromise = getChat(cid, socket.userId);
  const streamingPromise = redis.get(`chat:${cid}:isStreaming`);
  const qaPromise = db.chatQuestion.findMany({
    where: { chatId: cid },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      question: true,
      createdAt: true,
      ChatQuestionAnswer: {
        orderBy: { createdAt: "asc" },
        select: {
          answer: true,
          aiModelId: true,
          credits: true,
          base64Image: true,
          WebSearch: { select: { id: true } },
        },
      },
    },
  });

  const [chat, streamingData, qaPairs] = await Promise.all([
    chatPromise,
    streamingPromise,
    qaPromise,
  ]);

  if (!chat) {
    socket.emit("error", "Chat not found");
    return;
  }

  socket.join(`room:${chat.id}`);
  if (streamingData) {
    socket.emit("question_response_chunk", streamingData);
  }

  io.to(`room:${chat.id}`).emit("qa_pairs", { cid, qaPairs });
};
