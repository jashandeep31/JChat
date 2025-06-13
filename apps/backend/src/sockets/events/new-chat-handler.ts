import { db } from "../../lib/db.js";
import * as z from "zod";
import { SocketFunctionParams } from "../../models/types.js";
import { renameChatQueue } from "../../queues/rename-chat-queue.js";
import { redis } from "../../lib/db.js";
import { questionAnswerHandler } from "../utils/question-answer-handler.js";
import { getAttachment } from "../../services/attachment-cache.js";

const newChatSchema = z.object({
  question: z.string(),
  modelSlug: z.string(),
  isWebSearchEnabled: z.boolean(),
  attachmentId: z.string().optional(),
  projectId: z.string().optional(),
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
      ...(result.data.projectId ? { projectId: result.data.projectId } : {}),
    },
  });
  redis.set(`chat:${chat.id}`, JSON.stringify(chat), "EX", 20 * 60);

  socket.emit("chat_created", chat);
  const attachmentData = parsedData.attachmentId
    ? await getAttachment(parsedData.attachmentId)
    : null;
  const chatQuestion = await db.chatQuestion.create({
    data: {
      chatId: chat.id,
      question: result.data.question,
      ...(attachmentData ? { attachmentId: attachmentData.id } : {}),
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
  await questionAnswerHandler({
    chatQuestion,
    modelSlug: result.data.modelSlug,
    io,
    cid: chat.id,
    userId: socket.userId,
  });
};
