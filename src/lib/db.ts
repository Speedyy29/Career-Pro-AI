import { PrismaClient } from "@prisma/client";
import { validateEnv } from "@/lib/env";

// Validate all required environment variables at startup
validateEnv();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma client singleton for serverless environments.
 * Prevents connection exhaustion in dev mode by reusing the same client.
 * In production, Vercel's cold starts will create new connections as needed.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
