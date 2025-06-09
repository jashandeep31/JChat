import { askQuestion } from "../../models/index.js";
import * as z from "zod";
import { db } from "../../lib/db.js";
import { SocketFunctionParams } from "src/models/types.js";
const chatQuestionSchema = z.object({
  question: z.string(),
  cid: z.string(),
  isWebSearchEnabled: z.boolean(),
});

export const chatQuestionHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  const parsedData = JSON.parse(data);
  const result = chatQuestionSchema.parse(parsedData);

  const { question, cid } = result;
  const chatQuestion = await db.chatQuestion.create({
    data: {
      chatId: cid,
      question,
    },
  });

  // emit to all clients in the chat room
  io.to(`chat-${cid}`).emit(
    "question_created",
    JSON.stringify({
      cid: chatQuestion.chatId,
      question: chatQuestion.question,
      id: chatQuestion.id,
    })
  );

  // ask question to AI
  const res = await askQuestion(question, "gemini", io, cid);

  const chatQuestionAnswer = await db.chatQuestionAnswer.create({
    data: {
      aiModelId: "cmbnhzl8s0001punq71ndi2ho",
      chatQuestionId: chatQuestion.id,
      answer: res,
    },
  });
  io.to(`chat-${cid}`).emit(
    "question_answered",
    JSON.stringify({
      ...chatQuestionAnswer,
    })
  );
};
