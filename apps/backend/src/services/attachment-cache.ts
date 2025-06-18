import { Attachment } from "@repo/db";
import { db, redis } from "../lib/db.js";

export const getAttachment = async (id: string): Promise<Attachment | null> => {
  const key = `attachment:${id}`;
  try {
    const hit = await redis.get(key);
    if (hit) {
      return JSON.parse(hit);
    }
    const attachment = await db.attachment.findUnique({ where: { id } });
    if (!attachment) return null;
    await redis.set(key, JSON.stringify(attachment), "EX", 20 * 60);
    return attachment;
  } catch (err) {
    throw err;
  }
};
