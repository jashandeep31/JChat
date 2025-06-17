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

  const streamingData = await redis.get(`chat:${cid}:isStreaming`);
  if (streamingData) {
    socket.emit("question_response_chunk", streamingData);
  }
};
