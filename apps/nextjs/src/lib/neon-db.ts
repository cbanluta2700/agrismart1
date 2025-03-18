import { neon } from "@neondatabase/serverless";
import { PrismaClient } from "@prisma/client";

// For direct SQL queries
export function getNeonClient() {
  return neon(process.env.DATABASE_URL || "");
}

// Keep PrismaClient for schema operations and type safety
// but use connection pooling approach for serverless
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Helper function for raw queries
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
  const sql = getNeonClient();
  const queryText = query.replace(/\$\d+/g, (match) => `$${match.substring(1)}`);
  return sql.query(queryText, params) as Promise<T[]>;
}
