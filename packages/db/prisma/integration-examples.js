// Sample script demonstrating different ways to connect to Neon PostgreSQL
require('dotenv').config();

// ========== 1. Using Neon Serverless Driver ==========
async function testNeonServerless() {
  console.log('\n----- TESTING NEON SERVERLESS DRIVER -----');
  
  const { neon } = require('@neondatabase/serverless');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    console.log('Connection established with neon serverless');
    
    // Try a simple query
    const users = await sql`SELECT id, name, email FROM "User" LIMIT 5`;
    console.log('User query successful, results:', users);
    
    // Test querying one of our marketplace tables
    const products = await sql`SELECT id, name, price FROM "Product" LIMIT 5`;
    console.log('Product query results:', products);
    
    return true;
  } catch (error) {
    console.error('Neon serverless error:', error);
    return false;
  }
}

// ========== 2. Using Node-postgres ==========
async function testNodePostgres() {
  console.log('\n----- TESTING NODE-POSTGRES -----');
  
  const { Pool } = require('pg');
  
  try {
    // Create connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    
    // Test the connection
    const client = await pool.connect();
    console.log('Connection established with pg client');
    
    try {
      // Query users
      const { rows: users } = await client.query('SELECT id, name, email FROM "User" LIMIT 5');
      console.log('User query successful, results:', users);
      
      // Query products
      const { rows: products } = await client.query('SELECT id, name, price FROM "Product" LIMIT 5');
      console.log('Product query results:', products);
      
      return true;
    } catch (queryError) {
      console.error('Query error:', queryError);
      return false;
    } finally {
      // Always release the client
      client.release();
    }
  } catch (connectionError) {
    console.error('PG connection error:', connectionError);
    return false;
  }
}

// ========== 3. Using Prisma ==========
async function testPrisma() {
  console.log('\n----- TESTING PRISMA -----');
  
  try {
    // Important: We need to specify the schema path since we're using a custom schema
    const { PrismaClient } = require('@prisma/client');
    
    // Create a Prisma client instance
    // Note: Make sure prisma generate has been run with the right schema
    const prisma = new PrismaClient();
    
    try {
      console.log('Initializing Prisma client');
      
      // Query users
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        take: 5,
      });
      console.log('Prisma User query successful, results:', users);
      
      // Query products
      const products = await prisma.product.findMany({
        select: {
          id: true,
          name: true,
          price: true,
        },
        take: 5,
      });
      console.log('Prisma Product query results:', products);
      
      return true;
    } catch (queryError) {
      console.error('Prisma query error:', queryError);
      return false;
    } finally {
      // Disconnect the Prisma client
      await prisma.$disconnect();
    }
  } catch (prismaError) {
    console.error('Prisma initialization error:', prismaError);
    console.log('Note: If Prisma client is not generated, run: bunx prisma generate --schema=./prisma/compatible-schema.prisma');
    return false;
  }
}

// ========== Main Execution ==========
async function runTests() {
  console.log('TESTING DATABASE INTEGRATION PATTERNS');
  console.log('====================================');
  
  // Test Neon Serverless
  const neonResult = await testNeonServerless();
  
  // Test Node-postgres
  const pgResult = await testNodePostgres();
  
  // Test Prisma
  // Note: This may fail if prisma generate hasn't been run successfully
  // Uncomment to test Prisma if you've resolved the client generation issues
  // const prismaResult = await testPrisma();
  
  // Summary
  console.log('\n----- INTEGRATION TEST SUMMARY -----');
  console.log('Neon Serverless:', neonResult ? '✅ Working' : '❌ Failed');
  console.log('Node-postgres:', pgResult ? '✅ Working' : '❌ Failed');
  // console.log('Prisma:', prismaResult ? '✅ Working' : '❌ Failed');
  
  // Recommendations
  console.log('\n----- RECOMMENDATIONS -----');
  console.log('For best performance with Neon:');
  console.log('1. Use @neondatabase/serverless in serverless environments');
  console.log('2. Use connection pooling with pg for server environments');
  console.log('3. When using Prisma, ensure schema.prisma has:');
  console.log(`   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DATABASE_URL")
   }`);
}

// Run the tests
runTests()
  .then(() => console.log('\nTests completed'))
  .catch(err => console.error('Error running tests:', err));
