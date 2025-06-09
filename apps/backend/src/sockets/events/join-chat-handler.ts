import { db } from "../../lib/db.js";
import { SocketFunctionParams } from "../../models/types.js";
export const joinChatHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  const cid = data;
  const chat = await db.chat.findUnique({
    where: { id: cid, userId: socket.userId },
  });
  if (!chat) {
    socket.emit("error", "Chat not found");
    return;
  }
  socket.join(`chat-${chat.id}`);
};
