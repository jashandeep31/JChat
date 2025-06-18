import { db } from "../../lib/db.js";
import { SocketFunctionParams } from "../../models/types.js";
import * as z from "zod";
import { questionAnswerHandler } from "../utils/question-answer-handler.js";

const zodSchema = z.object({
  questionId: z.string(),
  cid: z.string(),
  modelSlug: z.string(),
});

export const reAnswerRequestHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  try {
    const parsedData = zodSchema.safeParse(data);
    if (parsedData.error) {
      socket.emit("error", "data is not valid");
      return;
    }
    const chatQuestion = await db.chatQuestion.findUnique({
      where: {
        id: parsedData.data.questionId,
      },
      include: {
        chat: true,
      },
    });

    if (!chatQuestion) {
      socket.emit("error", "Chat question not found ");
      return;
    }
    if (chatQuestion.chat.userId !== socket.userId) {
      socket.emit(`error`, "Chat does not belongs to you.");
      return;
    }

    questionAnswerHandler({
      chatQuestion: chatQuestion,
      modelSlug: parsedData.data.modelSlug,
      io,
      cid: parsedData.data.cid,
      userId: socket.userId,
    });
  } catch (e) {
    socket.emit("error", "Something went wrong in the request");
  }
};
