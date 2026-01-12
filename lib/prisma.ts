import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL no configurada");

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "development" ? { rejectUnauthorized: false } : { rejectUnauthorized: true },
    max: 10,
  });

  globalForPrisma.pool?.end().catch(() => {});
  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Helper para transacciones
 */
export async function prismaTransaction<T>(
  callback: (
    tx: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use"
    >
  ) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Verificar conexión DB
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;
