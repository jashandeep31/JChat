import { db, redis } from "../lib/db.js";

export const getAttachment = async (id: string) => {
  const key = `attachment:${id}`;
  try {
    const hit = await redis.get(key);
    console.log(hit);
    if (hit) {
      return JSON.parse(hit);
    }
    const attachment = await db.attachment.findUnique({ where: { id } });
    console.log(`attachment not found ${id}`, attachment);
    if (!attachment) return null;
    await redis.set(key, JSON.stringify(attachment), "EX", 20 * 60);
    return attachment;
  } catch (err) {
    throw err;
  }
};
