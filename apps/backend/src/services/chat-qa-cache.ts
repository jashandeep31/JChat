import { ChatQuestion, ChatQuestionAnswer } from "@repo/db";
import { db, redis } from "../lib/db.js";

const CHAT_TTL = 60 * 20;

const getChatQAKey = (cid: string): string => `chat-qa:${cid}`;

export async function getChatQACache(
  cid: string
): Promise<
  (ChatQuestion & { ChatQuestionAnswer: ChatQuestionAnswer[] })[] | null
> {
  const key = getChatQAKey(cid);
  try {
    const hit = await redis.get(key);
    if (hit) {
      return JSON.parse(hit);
    }
    const chatQA = await db.chatQuestion.findMany({
      where: { chatId: cid },
      include: {
        ChatQuestionAnswer: true,
      },
      orderBy: {
        createdAt: "desc", // Get most recent questions
      },
      take: 2, // Limit to 10 questions
    });

    if (chatQA.length === 0) return null;

    await redis.set(key, JSON.stringify(chatQA), "EX", CHAT_TTL);
    return chatQA;
  } catch (err) {
    console.error(`Error fetching chat QA cache for ${cid}:`, err);
    return null; // Return null instead of throwing to prevent app crashes
  }
}

export async function refreshChatQACache(cid: string): Promise<boolean> {
  const key = getChatQAKey(cid);
  try {
    await redis.del(key);

    const chatQA = await db.chatQuestion.findMany({
      where: { chatId: cid },
      include: {
        ChatQuestionAnswer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 2,
    });

    if (chatQA.length > 0) {
      await redis.set(key, JSON.stringify(chatQA), "EX", CHAT_TTL);
    }

    return true;
  } catch (err) {
    console.error(`Error refreshing chat QA cache for ${cid}:`, err);
    return false;
  }
}
