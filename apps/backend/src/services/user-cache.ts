import { db, redis } from "../lib/db.js";

export async function getUser(id: string) {
  const key = `user:${id}`;
  try {
    const hit = await redis.get(key);
    if (hit) {
      return JSON.parse(hit);
    }
    const user = await db.user.findUnique({ where: { id } });
    if (!user) return null;
    await redis.set(key, JSON.stringify(user), "EX", 20 * 60);
    return user;
  } catch (err) {
    throw err;
  }
}
