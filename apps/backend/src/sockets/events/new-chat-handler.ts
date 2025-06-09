import { Server, Socket } from "socket.io";
import { db } from "../../lib/db.js";
import * as z from "zod";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { SocketFunctionParams } from "src/models/types.js";

const newChatSchema = z.object({
  question: z.string(),
});

export const newChatHandler = async ({
  socket,
  io,
  data,
}: SocketFunctionParams) => {
  const parsedData = JSON.parse(data);
  const result = newChatSchema.safeParse(parsedData);

  if (!result.success) {
    socket.emit("error", result.error.message);
    return;
  }

  const chat = await db.chat.create({
    data: {
      name: "New Chat",
      userId: socket.userId,
    },
  });
  socket.emit("chat_created", chat);
  getChatName(result.data.question, chat.id, socket);
  await db.chatQuestion.create({
    data: {
      chatId: chat.id,
      question: result.data.question,
    },
  });
};

const getChatName = async (question: string, cid: string, socket: Socket) => {
  const { text } = await generateText({
    model: google("models/gemini-2.0-flash"),
    messages: [
      {
        role: "system",
        content:
          "You are a concise assistant. Given a user’s question, generate a clear English title summarizing its core topic in 10 words or fewer.",
      },
      { role: "user", content: question },
    ],
  });
  const chat = await db.chat.update({
    where: { id: cid },
    data: { name: text },
  });
  socket.emit("chat_name_updated", chat);
  return text;
};
