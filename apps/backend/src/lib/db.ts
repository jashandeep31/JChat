import { PrismaClient } from "@repo/db";
import { Redis } from "ioredis";

export const db = new PrismaClient();
export const redisDb = new Redis({
  maxRetriesPerRequest: null,
});
