import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getPrismaClient() {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurada en las variables de entorno");
  }

  if (process.env.NODE_ENV === "development") {
    connectionString = connectionString.replace(/sslmode=require/gi, "sslmode=no-verify");
    if (!connectionString.includes("sslmode=")) {
      connectionString += (connectionString.includes("?") ? "&" : "?") + "sslmode=no-verify";
    }
  }

  if (globalForPrisma.pool) {
    globalForPrisma.pool.end().catch(() => {
    });
    globalForPrisma.pool = undefined;
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "development" 
      ? {
          rejectUnauthorized: false,
        }
      : {
          rejectUnauthorized: true,
        },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  globalForPrisma.pool = pool;

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper para transacciones
 * @param callback Función que contiene las operaciones a ejecutar en la transacción
 * @returns Resultado de la función callback
 */
export async function prismaTransaction<T>(
  callback: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use">) => Promise<T>
): Promise<T> {
  return prisma.$transaction(callback);
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Helper para verificar la conexión a la base de datos
 * @returns true si la conexión es exitosa
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
