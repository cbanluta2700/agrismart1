/**
 * Script to initialize the basic database schema for auth
 */

// Direct import of required packages
const { neon } = require('@neondatabase/serverless');

// Get database connection string
const connectionUrl = process.env.POSTGRES_URL || '';
console.log(`Database connection: ${connectionUrl.includes('neon.tech') ? 'Neon PostgreSQL' : 'PostgreSQL'}`);
console.log(`Connection URL: ${connectionUrl.replace(/:[^:]*@/, ':****@')}`);

// Create SQL executor
const sql = neon(connectionUrl);

// Function to check database connection
async function checkDatabaseConnection() {
  try {
    // Simple query to check connection
    await sql`SELECT 1 as test`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Function to initialize schema
async function initializeSchema() {
  try {
    // Create a basic User table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('User table initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize schema:', error);
    return false;
  }
}

async function run() {
  try {
    console.log('Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to the database. Please check your connection settings.');
      process.exit(1);
    }
    
    console.log('\n✅ Database connection successful!');
    
    console.log('\nInitializing database schema...');
    const success = await initializeSchema();
    
    if (success) {
      console.log('\n✅ Database schema initialization complete!');
    } else {
      console.error('\n❌ Failed to initialize database schema.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the initialization
run();
