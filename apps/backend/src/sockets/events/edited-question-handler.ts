import { db } from "../../lib/db.js";
import { SocketFunctionParams } from "../../models/types.js";
import * as z from "zod";
import { questionAnswerHandler } from "../utils/question-answer-handler.js";

const editedQuestionSchema = z.object({
  questionId: z.string(),
  cid: z.string(),
  text: z.string(),
  modelId: z.string(),
});

export const editedQuestionHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  try {
    const result = editedQuestionSchema.safeParse(data);
    if (!result.success) {
      socket.emit("error", result.error.message);
      return;
    }
    const { questionId, cid, text, modelId } = result.data;
    const chatQuestion = await db.chatQuestion.update({
      where: {
        id: questionId,
      },
      data: {
        question: text,
      },
    });

    const model = await db.aiModel.findUnique({
      where: {
        id: modelId,
      },
    });
    if (!model) {
      socket.emit("error", "Model not found");
      return;
    }

    questionAnswerHandler({
      chatQuestion,
      modelSlug: model.slug,
      io,
      cid: chatQuestion.chatId,
      userId: socket.userId,
    });
  } catch (e) {
    socket.emit("error", "Something went wrong with question edit`");
  }
};
