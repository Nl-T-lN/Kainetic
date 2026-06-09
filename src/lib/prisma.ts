import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit due to Next.js Hot Module Replacement.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// We pass the DATABASE_URL (Port 6543) directly into the constructor here
// to ensure Next.js uses the Connection Pooler when reading/writing data.
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
