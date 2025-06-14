import { ApiKey } from "@repo/db";
import { db, redis } from "../lib/db.js";

export const getApi = async (
  companyId: string,
  userId: string
): Promise<ApiKey | null> => {
  const key = `api:${companyId}:${userId}`;
  const hit = await redis.get(key);
  if (hit) {
    return JSON.parse(hit);
  }
  const api = await db.apiKey.findUnique({
    where: { userId_companyId: { companyId, userId } },
  });
  if (!api) return null;
  await redis.set(key, JSON.stringify(api), "EX", 20 * 60);
  return api;
};
