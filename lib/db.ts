import { PrismaClient } from "./generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  try {
    const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
    const adapter = new PrismaLibSql({ url: dbUrl });
    return new PrismaClient({ adapter });
  } catch (error: any) {
    console.error("Database connection failed:", error?.message || error);
    throw new Error(
      "无法连接到数据库。请检查 DATABASE_URL 配置或运行 npx prisma migrate dev。"
    );
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
