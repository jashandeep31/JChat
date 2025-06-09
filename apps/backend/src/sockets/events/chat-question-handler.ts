import { Socket } from "socket.io";
import { askQuestion } from "../../models/index.js";
import * as z from "zod";
import { db } from "../../lib/db.js";
const chatQuestionSchema = z.object({
  question: z.string(),
  cid: z.string(),
  isWebSearchEnabled: z.boolean(),
});

export const chatQuestionHandler = async (socket: Socket, data: string) => {
  const parsedData = JSON.parse(data);
  const result = chatQuestionSchema.safeParse(parsedData);

  if (!result.success) {
    socket.emit("error", result.error.message);
    return;
  }
  const { question, cid } = result.data;
  const chatQuestion = await db.chatQuestion.create({
    data: {
      chatId: cid,
      question,
    },
  });
  socket.emit(
    "chat_question_created",
    JSON.stringify({
      cid: chatQuestion.chatId,
      question: chatQuestion.question,
      id: chatQuestion.id,
    })
  );

  const res = await askQuestion(question, "gemini", socket);
  const chatQuestionAnswer = await db.chatQuestionAnswer.create({
    data: {
      aiModelId: "cmbnhzl8s0001punq71ndi2ho",
      chatQuestionId: chatQuestion.id,
      answer: res,
    },
  });
  socket.emit(
    "question_answered",
    JSON.stringify({
      ...chatQuestionAnswer,
    })
  );
};
