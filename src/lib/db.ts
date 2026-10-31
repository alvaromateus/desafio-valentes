import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function safeHost(url: string | undefined): string {
  if (!url) return "MISSING";
  try {
    const u = new URL(url);
    return `${u.hostname}/${u.pathname.replace("/", "")}`;
  } catch {
    return "UNPARSEABLE";
  }
}

console.error(
  "[DEBUG_DB_HOST]",
  JSON.stringify({
    DATABASE_URL: safeHost(process.env.DATABASE_URL),
    DIRECT_URL: safeHost(process.env.DIRECT_URL),
  })
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
