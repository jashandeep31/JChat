import type { Chat } from "@repo/db";
import { db, redis } from "../lib/db.js";

const CHAT_TTL = 60 * 20;

export async function getChat(
  cid: string,
  userId: string
): Promise<Chat | null> {
  const key = `chat:${cid}`;
  try {
    const hit = await redis.get(key);
    if (hit) {
      const cached: Chat = JSON.parse(hit);
      if (cached.userId === userId) return cached;
    }
    const chat = await db.chat.findUnique({
      where: { id: cid, userId },
    });
    if (!chat) return null;
    await redis.set(key, JSON.stringify(chat), "EX", CHAT_TTL);
    return chat;
  } catch (err) {
    console.error("getChat cache error", err);
    return db.chat.findUnique({ where: { id: cid, userId } });
  }
}
