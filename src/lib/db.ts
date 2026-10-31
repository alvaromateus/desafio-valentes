import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function safeHost(raw: string | undefined, label: string) {
  if (!raw) {
    console.error("[DEBUG_DB_HOST]", label, "UNSET");
    return;
  }
  try {
    const u = new URL(raw);
    console.error("[DEBUG_DB_HOST]", label, u.hostname, u.pathname);
  } catch {
    console.error("[DEBUG_DB_HOST]", label, "PARSE_ERROR");
  }
}
safeHost(process.env.DATABASE_URL, "DATABASE_URL");
safeHost(process.env.DIRECT_URL, "DIRECT_URL");

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
