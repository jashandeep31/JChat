import { PrismaClient } from "@repo/db";
import { Redis } from "ioredis";
export const db = new PrismaClient();
export const redis = new Redis({
  maxRetriesPerRequest: null,
});
