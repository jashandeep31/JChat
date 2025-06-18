import { PrismaClient } from "@repo/db";
import { Redis } from "ioredis";
import { env } from "./env.js";

export const db = new PrismaClient();
export const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASSWORD || undefined,
  username: env.REDIS_USERNAME || undefined,
  maxRetriesPerRequest: null,
});
