import { PrismaClient } from "@prisma/client";

// Extend global type to include our custom property
declare global {
  var agentSystemInitialized: boolean | undefined;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });


if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
