/**
 * Script to fix the authentication schema for NextAuth.js
 */

const { neon } = require('@neondatabase/serverless');

// Get database connection string
const connectionUrl = process.env.DATABASE_URL || '';
console.log(`Database connection: ${connectionUrl.includes('neon.tech') ? 'Neon PostgreSQL' : 'PostgreSQL'}`);
console.log(`Connection URL: ${connectionUrl.replace(/:[^:]*@/, ':****@')}`);

// Create SQL executor
const sql = neon(connectionUrl);

async function fixAuthSchema() {
  try {
    // First check if User table exists and what columns it has
    const userTableCheck = await sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'User' AND table_schema = 'public'
    `;
    
    console.log('Existing User table columns:', userTableCheck.map(col => col.column_name));
    
    // Drop existing tables that depend on User to allow recreation
    try {
      await sql`DROP TABLE IF EXISTS "Session" CASCADE`;
      console.log('Dropped Session table');
    } catch (err) {
      console.error('Error dropping Session table:', err.message);
    }
    
    try {
      await sql`DROP TABLE IF EXISTS "Account" CASCADE`;
      console.log('Dropped Account table');
    } catch (err) {
      console.error('Error dropping Account table:', err.message);
    }
    
    // Recreate User table with correct schema for NextAuth
    try {
      await sql`DROP TABLE IF EXISTS "User" CASCADE`;
      console.log('Dropped User table');
      
      await sql`
        CREATE TABLE "User" (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT UNIQUE,
          "emailVerified" TIMESTAMP,
          image TEXT,
          password TEXT
        )
      `;
      console.log('Created User table with NextAuth schema');
    } catch (err) {
      console.error('Error recreating User table:', err.message);
    }
    
    // Create Account table for NextAuth
    try {
      await sql`
        CREATE TABLE "Account" (
          id TEXT PRIMARY KEY,
          "userId" TEXT NOT NULL,
          type TEXT NOT NULL,
          provider TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at INTEGER,
          token_type TEXT,
          scope TEXT,
          id_token TEXT,
          session_state TEXT,
          CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      
      await sql`
        CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" 
        ON "Account"(provider, "providerAccountId")
      `;
      
      console.log('Created Account table');
    } catch (err) {
      console.error('Error creating Account table:', err.message);
    }
    
    // Create Session table for NextAuth
    try {
      await sql`
        CREATE TABLE "Session" (
          id TEXT PRIMARY KEY,
          "sessionToken" TEXT UNIQUE NOT NULL,
          "userId" TEXT NOT NULL,
          expires TIMESTAMP NOT NULL,
          CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      console.log('Created Session table');
    } catch (err) {
      console.error('Error creating Session table:', err.message);
    }
    
    // Verify tables were created
    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    console.log('\nVerified tables:');
    tables.forEach(table => {
      console.log(`- ${table.tablename}`);
    });
    
    return true;
  } catch (error) {
    console.error('Schema fix failed:', error);
    return false;
  }
}

// Execute the script
fixAuthSchema()
  .then(success => {
    console.log(success ? '\n\u2705 Auth schema fix completed successfully!' : '\n\u274c Auth schema fix failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
