import { PrismaClient } from "@repo/db";
import { Redis } from "iovalkey"; // pick ONE client: iovalkey or ioredis ≥ 5.6
import { env } from "./env.js";

export const db = new PrismaClient();

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT), // e.g. 25061
  username: env.REDIS_USERNAME || "default",
  password: env.REDIS_PASSWORD,
  tls: {},
  maxRetriesPerRequest: null,
});
