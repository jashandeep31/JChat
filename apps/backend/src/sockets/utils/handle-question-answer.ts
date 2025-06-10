import { ChatQuestion } from "@repo/db";
import { Server } from "socket.io";
import { db } from "../../lib/db.js";
import { askQuestion } from "../../models/index.js";

export const handleQuestionAnswer = async ({
  chatQuestion,
  io,
  cid,
}: {
  chatQuestion: ChatQuestion;
  io: Server;
  cid: string;
}) => {
  const res = await askQuestion(chatQuestion, "gemini", io, cid);
  const chatQuestionAnswer = await db.chatQuestionAnswer.create({
    data: {
      aiModelId: "cmbnhzl8s0001punq71ndi2ho",
      chatQuestionId: chatQuestion.id,
      answer: res,
    },
  });
  io.to(`room:${cid}`).emit("question_answered", {
    cid,
    answer: chatQuestionAnswer,
  });
};
