import { PrismaClient } from "@repo/db";
import Valkey from "iovalkey";

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
export const redis = new Valkey({
  host: process.env.VALKEY_HOST ?? process.env.REDIS_HOST, // keep legacy fallbacks
  port: Number(process.env.VALKEY_PORT ?? process.env.REDIS_PORT ?? 6379),
  password: process.env.VALKEY_PASSWORD ?? process.env.REDIS_PASSWORD,
  // DigitalOcean clusters enforce TLS; pass an empty object to enable it.
  tls: process.env.VALKEY_TLS === "false" ? undefined : {},
  maxRetriesPerRequest: null,
});

// Handle process termination to close connections
process.on("beforeExit", async () => {
  await db.$disconnect();
  await redis.quit();
});
