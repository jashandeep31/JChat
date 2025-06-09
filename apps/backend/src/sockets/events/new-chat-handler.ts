import { Socket } from "socket.io";
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
  const { text } = await generateText({
    model: google("models/gemini-2.0-flash"),
    messages: [
      {
        role: "system",
        content:
          "You are a concise assistant. Given a user’s question, generate a clear English title summarizing its core topic in 10 words or fewer.",
      },
      { role: "user", content: result.data.question },
    ],
  });

  const chat = await db.chat.create({
    data: {
      name: text,
      userId: socket.userId,
    },
  });
  await db.chatQuestion.create({
    data: {
      chatId: chat.id,
      question: result.data.question,
    },
  });

  socket.emit("chat_created", chat.id);
};
