import type { Chat } from "@repo/db";
import { db, redis } from "../lib/db.js";

const CHAT_TTL = 60 * 20;
export async function getChat(
  cid: string,
  userId: string | null,
  allowWithoutUserId = false
): Promise<Chat | null> {
  const key = `chat:${cid}`;
  try {
    if (!allowWithoutUserId && !userId) {
      return null;
    }
    const hit = await redis.get(key);
    if (hit) {
      const cached: Chat = JSON.parse(hit);
      if (!userId || cached.userId === userId) return cached;
    }

    const where = { id: cid };
    if (userId) Object.assign(where, { userId });

    const chat = await db.chat.findUnique({
      where,
    });

    if (!chat) return null;
    await redis.set(key, JSON.stringify(chat), "EX", CHAT_TTL);
    return chat;
  } catch (err) {
    throw err;
  }
}
