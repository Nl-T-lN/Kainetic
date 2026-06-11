import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit due to Next.js Hot Module Replacement.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

try {
  // We instantiate PrismaClient. If DATABASE_URL is stripped by Next.js during build-time
  // static analysis, this will throw an InitializationError.
  prismaInstance = new PrismaClient();
} catch (e) {
  // Provide a dummy object so module evaluation doesn't crash the Next.js build.
  // It won't be used because our API routes are force-dynamic.
  prismaInstance = {} as PrismaClient;
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;




