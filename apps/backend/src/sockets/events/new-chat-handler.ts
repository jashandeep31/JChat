import { db } from "../../lib/db.js";
import * as z from "zod";
import { SocketFunctionParams } from "src/models/types.js";
import { renameChatQueue } from "../../queues/rename-chat-queue.js";
import { redis } from "../../lib/db.js";

const newChatSchema = z.object({
  question: z.string(),
});

export const newChatHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  const parsedData = JSON.parse(data);
  const result = newChatSchema.safeParse(parsedData);

  if (!result.success) {
    socket.emit("error", result.error.message);
    return;
  }

  const chat = await db.chat.create({
    data: {
      name: "New Chat",
      userId: socket.userId,
    },
  });
  redis.set(`chat:${chat.id}`, JSON.stringify(chat), "EX", 20 * 60);

  socket.emit("chat_created", chat);
  await db.chatQuestion.create({
    data: {
      chatId: chat.id,
      question: result.data.question,
    },
  });
  await renameChatQueue.add("rename-chat", {
    chatId: chat.id,
    question: result.data.question,
    socketId: socket.id,
  });
};
