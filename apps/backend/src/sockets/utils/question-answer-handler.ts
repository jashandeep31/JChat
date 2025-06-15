import { ChatQuestion, User, WebSearch } from "@repo/db";
import { Server } from "socket.io";
import { db, redis } from "../../lib/db.js";
import { askQuestion } from "../../models/index.js";
import { getUser } from "../../services/user-cache.js";
import { getApi } from "../../services/api-cache.js";
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
      io.to(`room:${cid}`).emit("error", "Model not found ");
      io.to(`room:${cid}`).emit("question_answered", {
        cid,
        answer: sendDummyAnswer("Model not found", chatQuestion.id),
      });
      return;
    }
    const apiKey = (await getApi(model.companyId, user.id))?.key || null;
    if (model.credits > user.credits && !apiKey) {
      io.to(`room:${cid}`).emit("error", "Not enough credits");
      io.to(`room:${cid}`).emit("question_answered", {
        cid,
        answer: sendDummyAnswer("Not enough credits", chatQuestion.id),
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
        answer: sendDummyAnswer(
          "Subscription is required to use the model",
          chatQuestion.id
        ),
      });
      return;
    }
    let credits = 0;
    credits = credits + model.credits;
    if (chatQuestion.attachmentId) {
      credits += 3;
    }
    if (chatQuestion.webSearch) {
      credits += 3;
    }
    const res = await askQuestion(chatQuestion, model.id, io, cid);
    if (res === 404) {
      io.to(`room:${cid}`).emit("error", "Model not found");
      io.to(`room:${cid}`).emit("question_answered", {
        cid,
        answer: sendDummyAnswer("Model not found", chatQuestion.id),
      });
      return;
    }
    const chatQuestionAnswer = await db.chatQuestionAnswer.create({
      data: {
        aiModelId: model.id,
        chatQuestionId: chatQuestion.id,
        answer: res.text,
        reasoning: res.reasoning.length > 0 ? res.reasoning : null,
        base64Image: res.images,
        credits: apiKey ? credits - model.credits : credits,
      },
    });
    let dbWebSearch: WebSearch[] = [];
    if (res.webSearches.length) {
      await db.webSearch.createMany({
        data: res.webSearches.map((webSearch) => ({
          chatQuestionAnswerId: chatQuestionAnswer.id,
          title: webSearch.title,
          url: webSearch.url,
        })),
      });

      dbWebSearch = await db.webSearch.findMany({
        where: {
          chatQuestionAnswerId: chatQuestionAnswer.id,
        },
      });
    }

    io.to(`room:${cid}`).emit("question_answered", {
      cid,
      answer: { ...chatQuestionAnswer, WebSearch: dbWebSearch },
    });

    const updatedUser = await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        credits: {
          decrement: credits,
        },
      },
    });
    await redis.del(`user:${user.id}`);
    await redis.set(
      `user:${user.id}`,
      JSON.stringify(updatedUser),
      "EX",
      20 * 60
    );
  } catch (error) {
    console.log(error);
    io.to(`room:${cid}`).emit("error", "Something went wrong");
  }
};

const sendDummyAnswer = (answer: string, chatQuestionId: string) => {
  return {
    id: "",
    credits: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    chatQuestionId,
    answer,
    reasoning: "",
    aiModelId: "",
    WebSearch: [],
  };
};
