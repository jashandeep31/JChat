import { PrismaClient } from "@repo/db";
import { Redis } from "ioredis";

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { db: PrismaClient };

export const db =
  globalForPrisma.db ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}

// Initialize Redis with connection pooling
export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

// Handle process termination to close connections
process.on("beforeExit", async () => {
  await db.$disconnect();
  await redis.quit();
});
