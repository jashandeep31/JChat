import { db } from "../../lib/db.js";
import * as z from "zod";
import { SocketFunctionParams } from "src/models/types.js";
import { renameChatQueue } from "../../queues/rename-chat-queue.js";
import { redis } from "../../lib/db.js";
import { handleQuestionAnswer } from "../utils/handle-question-answer.js";

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
  const chatQuestion = await db.chatQuestion.create({
    data: {
      chatId: chat.id,
      question: result.data.question,
    },
  });

  io.to(`room:${chat.id}`).emit("question_created", {
    cid: chat.id,
    question: chatQuestion,
  });

  const current = Date.now();
  await renameChatQueue.add("rename-chat", {
    chatId: chat.id,
    question: result.data.question,
    socketId: socket.id,
  });
  console.log(Date.now() - current, "ms is taken");
  await handleQuestionAnswer({ chatQuestion, io, cid: chat.id });
};
