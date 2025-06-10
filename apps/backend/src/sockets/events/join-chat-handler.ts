import { getChat } from "../../services/chat-cache.js";
import { db, redis } from "../../lib/db.js";
import { SocketFunctionParams } from "../../models/types.js";
export const joinChatHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  const cid = data;
  const chat = await getChat(cid, socket.userId);
  if (!chat) {
    socket.emit("error", "Chat not found");
    return;
  }
  socket.join(`room:${chat.id}`);

  const isStreaming = await redis.get(`chat:${chat.id}:isStreaming`);
  if (isStreaming) {
    socket.emit(
      "question_response_chunk",
      JSON.stringify({ data: isStreaming })
    );
  }

  const qaPairs = await db.chatQuestion.findMany({
    where: { chatId: cid },
    orderBy: { createdAt: "asc" },
    include: { ChatQuestionAnswer: { orderBy: { createdAt: "asc" } } },
  });
  io.to(`room:${chat.id}`).emit("qa_pairs", { cid: cid, qaPairs });
};
