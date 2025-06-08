import { Socket } from "socket.io";
import { db } from "../../lib/db.js";
import * as z from "zod";

const newChatSchema = z.object({
  question: z.string(),
});

export const newChatHandler = async (socket: Socket, data: string) => {
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
  await db.chatQuestion.create({
    data: {
      chatId: chat.id,
      question: result.data.question,
    },
  });

  socket.emit("chat_created", chat.id);
};
