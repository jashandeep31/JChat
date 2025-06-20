import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { Job, Queue, Worker } from "bullmq";
import { db, redis } from "../lib/db.js";
import { getIO } from "./index.js";
import { Redis } from "ioredis";

export const renameChatQueue = new Queue("rename-chat-queue", {
  connection: redis as unknown as Redis,
});
const worker = new Worker(
  "rename-chat-queue",
  async (job: Job<{ chatId: string; question: string; socketId: string }>) => {
    if (!job.data) {
      console.error("No data provided in job");
      return null;
    }

    const { chatId, question, socketId } = job.data;

    try {
      // Generate a chat name using the AI
      const { text: chatName } = await generateText({
        model: google("models/gemini-2.0-flash"),
        messages: [
          {
            role: "system",
            content:
              "You are a concise assistant. Given a user's question, generate a clear English title summarizing its core topic in 10 words or fewer.",
          },
          { role: "user", content: question },
        ],
      });

      // Update the chat with the new name
      const updatedChat = await db.chat.update({
        where: { id: chatId },
        data: { name: chatName },
      });

      redis.del(`chat:${chatId}`);
      redis.set(`chat:${chatId}`, JSON.stringify(updatedChat), "EX", 20 * 60);

      // Notify the specific client that requested the chat name update
      if (socketId) {
        const io = getIO();
        io.to(socketId).emit("chat_name_updated", updatedChat);
      }

      return updatedChat;
    } catch (error) {
      console.error("Error processing chat rename job:", error);
      throw error; // This will mark the job as failed
    }
  },
  { connection: redis as unknown as Redis }
);

export default worker;
