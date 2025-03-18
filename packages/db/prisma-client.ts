// prisma-client.ts
import { PrismaClient } from '@prisma/client'
import { neon } from '@neondatabase/serverless'
import * as crypto from 'crypto';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { 
  prisma: any;
  neonClient: any;
}

// Initialize Neon client for direct SQL queries
export const sql = globalForPrisma.neonClient || neon(process.env.DATABASE_URL || "");

// Mock Prisma client to match the User model structure from schema.prisma
export const prisma = globalForPrisma.prisma || {
  // Mock methods to prevent constructor errors
  user: {
    findUnique: async (args: any) => {
      try {
        const { email, id } = args.where || {};
        
        if (email) {
          const users = await sql`SELECT * FROM "User" WHERE email = ${email}`;
          return users && Array.isArray(users) && users.length > 0 ? users[0] : null;
        }
        
        if (id) {
          const users = await sql`SELECT * FROM "User" WHERE id = ${id}`;
          return users && Array.isArray(users) && users.length > 0 ? users[0] : null;
        }
        
        return null;
      } catch (error) {
        console.error("Error in findUnique:", error);
        return null;
      }
    },
    create: async (args: any) => {
      try {
        const { id, name, email, password, role } = args.data;
        const userId = id || crypto.randomUUID();
        
        try {
          // Note: User table doesn't have createdAt and updatedAt columns according to schema
          const result = await sql`
            INSERT INTO "User" (id, name, email, password, role) 
            VALUES (${userId}, ${name}, ${email}, ${password}, ${role || 'BUYER'}) 
            RETURNING *
          `;
          
          return result && Array.isArray(result) && result.length > 0 ? result[0] : null;
        } catch (sqlError) {
          console.error("SQL Error:", sqlError);
          throw sqlError;
        }
      } catch (error) {
        console.error("Error in create:", error);
        throw error;
      }
    },
    findMany: async (args: any) => {
      try {
        const limit = args?.take || 100;
        const offset = args?.skip || 0;
        
        // Handle basic query with optional filtering
        const users = await sql`SELECT * FROM "User" LIMIT ${limit} OFFSET ${offset}`;
        return users && Array.isArray(users) ? users : [];
      } catch (error) {
        console.error("Error in findMany:", error);
        return [];
      }
    },
    // Add more mock methods as needed
  },
  // Add mocks for other database models as needed
};

// Save to global in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.neonClient = sql;
  globalForPrisma.prisma = prisma;
}
