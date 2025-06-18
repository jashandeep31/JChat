import { getChat } from "../../services/chat-cache.js";
import { db } from "../../lib/db.js";
import { SocketFunctionParams } from "../../models/types.js";
import * as z from "zod";
const branchOffSchema = z.object({
  questionId: z.string(),
  cid: z.string(),
});

export const branchOffHandler = async ({
  data,
  socket,
  io,
}: SocketFunctionParams) => {
  const { questionId, cid } = branchOffSchema.parse(data);
  const cachedChat = await getChat(cid, socket.userId);
  if (!cachedChat) {
    socket.emit("error", "Chat not found");
    return;
  }
  const newChat = await db.chat.create({
    data: {
      name: `Branch ${cachedChat.name}`,
      userId: socket.userId,
      type: "BRANCHED",
    },
  });
  socket.emit("chat_branched", {
    from: cid,
    to: newChat.id,
    tillQuestionId: questionId,
    data: { ...newChat },
  });

  const chatQuestion = await db.chatQuestion.findUniqueOrThrow({
    where: { id: questionId },
    select: { createdAt: true },
  });

  const chat = await db.chat.findUniqueOrThrow({
    where: { id: cid },
    select: {
      name: true,
      ChatQuestion: {
        where: {
          createdAt: { lte: new Date(chatQuestion.createdAt.getTime() + 2000) },
        },
        select: {
          question: true,
          attachmentId: true,
          ChatQuestionAnswer: {
            select: {
              answer: true,
              aiModelId: true,
              credits: true,
              imageUrl: true,
            },
          },
        },
      },
    },
  });

  await db.chat.update({
    where: { id: newChat.id },
    data: {
      name: `Branch ${chat.name}`,
      userId: socket.userId,
      type: "BRANCHED",
      ChatQuestion: {
        create: chat.ChatQuestion.map((cq) => ({
          question: cq.question,
          attachmentId: cq.attachmentId,
          ChatQuestionAnswer: {
            createMany: { data: cq.ChatQuestionAnswer },
          },
        })),
      },
    },
  });
};
