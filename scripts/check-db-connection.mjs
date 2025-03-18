#!/usr/bin/env node

/**
 * This script checks the database connection to help diagnose issues
 * Run with: bun run scripts/check-db-connection.mjs
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const POSTGRES_URL = process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('ERROR: POSTGRES_URL environment variable is not set');
  process.exit(1);
}

async function checkDbConnection() {
  console.log('Checking database connection...');
  console.log(`Using connection URL: ${POSTGRES_URL.replace(/\/\/([^:]+):[^@]+@/, '//******:******@')}`);

  // Check if this is a Neon database
  const isNeonDb = POSTGRES_URL.includes('neon.tech');
  if (isNeonDb) {
    console.log('\nDetected Neon PostgreSQL database');
    console.log('Note: Neon databases use serverless connections and may require the @neondatabase/serverless package');
  }

  try {
    // Parse connection details from the URL
    const url = new URL(POSTGRES_URL);
    const host = url.hostname;
    const port = url.port || '5432';
    const database = url.pathname.substring(1); // Remove leading slash
    const username = url.username;

    // Check if PostgreSQL is running
    console.log('\nChecking if PostgreSQL server is reachable...');
    try {
      if (isNeonDb) {
        console.log('Skipping pg_isready check for Neon database (not applicable for serverless connections)');
        
        // For Neon, we'll rely on the driver's ability to connect
        console.log('Using Neon serverless connection instead');
      } else {
        const { stdout } = await execPromise(`pg_isready -h ${host} -p ${port}`);
        console.log(`PostgreSQL server status: ${stdout.trim()}`);
      }
    } catch (error) {
      console.error(`PostgreSQL server check failed: ${error.message}`);
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\nCONNECTION REFUSED: The PostgreSQL server is not running or not accepting connections.');
        console.error('Please make sure PostgreSQL is running on the specified host and port.');
      }
    }

    // Import modules dynamically based on the database type
    if (isNeonDb) {
      console.log('\nTesting database connection using Neon serverless driver...');
      try {
        // Dynamically import the Neon serverless driver
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(POSTGRES_URL);
        
        // Execute a simple query
        const result = await sql`SELECT current_database() as database, current_user as user`;
        console.log('Connection test successful!');
        console.log(`Connected to database: ${result[0].database}`);
        console.log(`Connected as user: ${result[0].user}`);
        
        // Check schema structure
        console.log('\nVerifying database schema...');
        const tables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `;
        console.log(`Found ${tables.length} tables in database`);
        if (tables.length > 0) {
          console.log('Tables:', tables.map(t => t.table_name).join(', '));
        }
        
        console.log('\n✅ Neon database connection is working correctly!');
      } catch (error) {
        console.error('\n❌ Neon database connection test failed:');
        console.error(error);
        throw error;
      }
    } else {
      // Test connection using the application's database client
      console.log('\nTesting database connection by querying database...');
      
      // Import the database from the application
      const { db } = await import('@saasfly/db');
      
      // Execute a simple query
      const result = await db.selectFrom('User').select('id').limit(1).execute();
      console.log('Connection test successful!');
      console.log(`Query returned ${result.length} results`);
      
      // Check schema structure
      console.log('\nVerifying database schema...');
      const tables = await db.introspection.getTables();
      console.log(`Found ${tables.length} tables in database`);
      console.log('Tables:', tables.map(t => t.name).join(', '));

      console.log('\n✅ Database connection is working correctly!');
    }
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error(error);
    
    if (error.message && error.message.includes('WebSocket')) {
      console.error('\nWebSocket error detected. This might be related to:');
      console.error('1. The @vercel/postgres-kysely package trying to use WebSockets');
      console.error('2. A configuration issue with the connection string');
      console.error('\nTry these solutions:');
      console.error('- Check your POSTGRES_URL format (should be postgresql://...)');
      console.error('- Ensure your PostgreSQL server supports the connection method');
      
      if (isNeonDb) {
        console.error('\nFor Neon databases specifically:');
        console.error('- Make sure you have installed @neondatabase/serverless package');
        console.error('- Use the neon() function for direct serverless connections');
        console.error('- Consider updating your database client configuration to use Neon\'s specific connection methods');
      }
    }

    process.exit(1);
  }
}

checkDbConnection();
