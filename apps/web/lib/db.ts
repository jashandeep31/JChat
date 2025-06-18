import { PrismaClient } from "@repo/db";
import { Redis } from "iovalkey";

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

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT), // e.g. 25061
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  tls: {},
  maxRetriesPerRequest: null,
});

// Handle process termination to close connections
process.on("beforeExit", async () => {
  await db.$disconnect();
  await redis.quit();
});
