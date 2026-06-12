import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Mock the environment variable during Next.js build time if it's missing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://dummy:dummy@dummy:5432/dummy";
}

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// If the cached object is a dummy (missing typical Prisma methods like user), wipe it out
if (globalForPrisma.prisma && !globalForPrisma.prisma.user) {
  globalForPrisma.prisma = undefined;
}

if (!globalForPrisma.prisma) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Ensures a user exists in the local Prisma database.
 * Ignores P2002 Unique Constraint errors that occur during parallel syncs.
 */
export async function ensureUserExists(user: any) {
  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name,
        avatarUrl: user.user_metadata?.avatar_url,
      }
    });
  } catch (e: any) {
    // Ignore P2002 (Unique constraint failed) race conditions during parallel syncs
    if (e.code !== 'P2002') throw e;
  }
}
