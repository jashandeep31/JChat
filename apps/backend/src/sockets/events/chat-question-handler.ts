import * as z from "zod";
import { db } from "../../lib/db.js";
import { SocketFunctionParams } from "src/models/types.js";
import { questionAnswerHandler } from "../utils/question-answer-handler.js";
const chatQuestionSchema = z.object({
  question: z.string(),
  cid: z.string(),
  modelSlug: z.string(),
  isWebSearchEnabled: z.boolean(),
});

export const chatQuestionHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  try {
    const parsedData = JSON.parse(data);
    console.log(parsedData);
    const result = chatQuestionSchema.safeParse(parsedData);
    if (!result.success) {
      socket.emit("error", result.error.message);
      return;
    }
    const { question, cid, modelSlug } = result.data;

    const chatQuestion = await db.chatQuestion.create({
      data: {
        chatId: cid,
        question,
      },
    });
    io.to(`room:${cid}`).emit("question_created", {
      cid: chatQuestion.chatId,
      question: chatQuestion,
    });
    await questionAnswerHandler({
      chatQuestion,
      modelSlug: modelSlug,
      io,
      cid,
      userId: socket.userId,
    });
  } catch (error) {
    console.log(error);
    socket.emit("error", "Something went wrong");
  }
};
