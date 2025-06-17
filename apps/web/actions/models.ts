"use server";

import { db, redis } from "@/lib/db";

export const getModels = async () => {
  const key = "models";

  const hit = await redis.get(key);
  if (hit) {
    return JSON.parse(hit);
  }
  const models = await db.aiModel.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      company: true,
    },
  });
  await redis.set(key, JSON.stringify(models), "EX", 20 * 60);
  return models;
};
