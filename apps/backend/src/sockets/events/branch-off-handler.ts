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
  const result = branchOffSchema.parse(data);

  const chatQuestion = await db.chatQuestion.findUnique({
    where: { id: result.questionId },
  });

  if (!chatQuestion) {
    throw new Error("Chat question not found");
  }

  const chat = await db.chat.findUnique({
    where: { id: result.cid },
    include: {
      ChatQuestion: {
        where: {
          createdAt: {
            lte: chatQuestion.createdAt,
          },
        },
        include: {
          ChatQuestionAnswer: true,
        },
      },
    },
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  await db.$transaction(async (tx) => {
    const newChat = await tx.chat.create({
      data: {
        name: `Branch ${chat.name}`,
        userId: socket.userId,
        type: "BRANCHED",
      },
    });

    // Create ChatQuestions and their Answers manually
    for (const cq of chat.ChatQuestion) {
      const newCQ = await tx.chatQuestion.create({
        data: {
          chatId: newChat.id,
          question: cq.question,
          attachmentId: cq.attachmentId,
        },
      });

      if (cq.ChatQuestionAnswer.length > 0) {
        await tx.chatQuestionAnswer.createMany({
          data: cq.ChatQuestionAnswer.map((answer) => ({
            chatQuestionId: newCQ.id,
            answer: answer.answer,
            aiModelId: answer.aiModelId,
            credits: answer.credits,
            base64Image: answer.base64Image,
          })),
        });
      }
    }

    socket.emit("chat_created", newChat);
  });
};
