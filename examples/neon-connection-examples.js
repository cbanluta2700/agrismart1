/**
 * Neon PostgreSQL Connection Examples
 * This file demonstrates different methods to connect to Neon PostgreSQL
 */

// Example 1: Using @vercel/postgres
// ==================================
// This is recommended for Vercel deployments
import { sql } from '@vercel/postgres';

export async function vercelPgExample() {
  try {
    // Simple query
    const { rows } = await sql`SELECT * FROM users LIMIT 5`;
    return rows;
    
    // Parameterized query
    const userId = 123;
    const user = await sql`SELECT * FROM users WHERE id = ${userId}`;
    
    // Multiple statements in a transaction
    await sql.begin(async (sql) => {
      await sql`UPDATE accounts SET balance = balance - 100 WHERE user_id = ${userId}`;
      await sql`INSERT INTO transactions (user_id, amount) VALUES (${userId}, -100)`;
    });
  } catch (error) {
    console.error('Vercel Postgres error:', error);
    throw error;
  }
}

// Example 2: Using postgres.js
// ===========================
// Modern, Promise-based PostgreSQL client
import postgres from 'postgres';

// Client setup
const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'verify-full', // For Neon, use verify-full to validate SSL certificates
  max: 10, // Connection pool size
  idle_timeout: 20, // Close connections after this many seconds of inactivity
  connect_timeout: 10, // Give up connecting after this many seconds
});

export async function postgresJsExample() {
  try {
    // Simple query
    const users = await sql`SELECT * FROM users LIMIT 5`;
    
    // Parameterized query
    const userId = 123;
    const user = await sql`SELECT * FROM users WHERE id = ${userId}`;
    
    // Transactions
    await sql.begin(async (sql) => {
      await sql`UPDATE accounts SET balance = balance - 100 WHERE user_id = ${userId}`;
      await sql`INSERT INTO transactions (user_id, amount) VALUES (${userId}, -100)`;
    });
    
    return users;
  } catch (error) {
    console.error('postgres.js error:', error);
    throw error;
  } finally {
    // Release all connections
    await sql.end();
  }
}

// Example 3: Using node-postgres (pg)
// ==================================
// Traditional node PostgreSQL client
import { Pool } from 'pg';

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true, // Set to false if using self-signed certificates
  },
  max: 20, // Max number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection not established
});

export async function nodePgExample() {
  let client;
  try {
    // Get a client from the pool
    client = await pool.connect();
    
    // Simple query
    const { rows: users } = await client.query('SELECT * FROM users LIMIT 5');
    
    // Parameterized query
    const userId = 123;
    const { rows: user } = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    // Transaction
    await client.query('BEGIN');
    try {
      await client.query('UPDATE accounts SET balance = balance - 100 WHERE user_id = $1', [userId]);
      await client.query('INSERT INTO transactions (user_id, amount) VALUES ($1, -100)', [userId]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
    
    return users;
  } catch (error) {
    console.error('node-pg error:', error);
    throw error;
  } finally {
    // Release client back to the pool
    if (client) client.release();
  }
}

// Example 4: Using Prisma ORM
// ==========================
// Full-featured ORM for TypeScript and Node.js
import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable logging (optional)
});

export async function prismaExample() {
  try {
    // Simple query using model methods
    const users = await prisma.user.findMany({
      take: 5,
    });
    
    // Get a specific user
    const userId = 123;
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    // Transaction
    const transaction = await prisma.$transaction([
      prisma.account.update({
        where: { userId },
        data: { balance: { decrement: 100 } },
      }),
      prisma.transaction.create({
        data: { userId, amount: -100 },
      }),
    ]);
    
    // Raw query if needed
    const rawResult = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
    
    return users;
  } catch (error) {
    console.error('Prisma error:', error);
    throw error;
  } finally {
    // Disconnect the client
    await prisma.$disconnect();
  }
}

// Example component showcasing data fetching in a Next.js page
// ===========================================================
export default async function DataPage() {
  // Choose any of the above methods to fetch data
  // For example, using Prisma:
  const data = await prismaExample().catch(e => {
    console.error('Failed to fetch data:', e);
    return [];
  });
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Database Records</h1>
      
      {data.length === 0 ? (
        <p>No records found or error fetching data.</p>
      ) : (
        <div className="grid gap-4">
          {data.map((item, index) => (
            <div key={index} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{item.name || item.title}</h2>
              <p>{item.description || item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
