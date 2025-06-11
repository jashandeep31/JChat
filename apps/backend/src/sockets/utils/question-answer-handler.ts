import { ChatQuestion, User } from "@repo/db";
import { Server } from "socket.io";
import { db } from "../../lib/db.js";
import { askQuestion } from "../../models/index.js";
import { getUser } from "../../services/user-cache.js";

const aiModels = await db.aiModel.findMany();
export const questionAnswerHandler = async ({
  chatQuestion,
  modelSlug,
  io,
  cid,
  userId,
}: {
  chatQuestion: ChatQuestion;
  modelSlug: string;
  io: Server;
  cid: string;
  userId: string;
}) => {
  try {
    const userRaw = await getUser(userId);
    if (!userRaw) {
      io.to(`room:${cid}`).emit("error", "User not found");
      return;
    }
    const user = userRaw as User;
    const model = aiModels.find((model) => model.slug === modelSlug);
    if (!model) {
      io.to(`room:${cid}`).emit("error", "Model not found");
      io.to(`room:${cid}`).emit("question_answered", {
        cid,
        answer: "Model not found",
      });
      return;
    }
    if (model.requiresPro && !user.proUser) {
      io.to(`room:${cid}`).emit(
        "error",
        `Subscription is required to use the model ${model.name}`
      );
      io.to(`room:${cid}`).emit("question_answered", {
        cid,
        answer: "Subscription is required to use the model",
      });
      return;
    }

    const res = await askQuestion(chatQuestion, model.id, io, cid);
    if (res === 404) {
      io.to(`room:${cid}`).emit("error", "Model not found");
      io.to(`room:${cid}`).emit("question_answered", {
        cid,
        answer: {
          id: "",
          credits: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          chatQuestionId: chatQuestion.id,
          answer: "Model not found",
          aiModelId: model.id,
        },
      });
      return;
    }
    const chatQuestionAnswer = await db.chatQuestionAnswer.create({
      data: {
        aiModelId: model.id,
        chatQuestionId: chatQuestion.id,
        answer: res,
      },
    });

    io.to(`room:${cid}`).emit("question_answered", {
      cid,
      answer: chatQuestionAnswer,
    });
  } catch (error) {
    io.to(`room:${cid}`).emit("error", "Something went wrong");
  }
};
