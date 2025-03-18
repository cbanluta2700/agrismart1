#!/usr/bin/env node

/**
 * Simple Database Connection Check Script for Neon Database
 */
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
config({ path: path.resolve(__dirname, '../.env.local') });

async function checkNeonConnection() {
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('ERROR: POSTGRES_URL environment variable is not set');
    process.exit(1);
  }
  
  console.log('Checking Neon database connection...');
  console.log(`Using connection URL: ${connectionString.replace(/\/\/([^:]+):[^@]+@/, '//******:******@')}`);
  
  try {
    const sql = neon(connectionString);
    
    // Test with a simple query
    console.log('\nTesting database connection by querying...');
    const result = await sql`SELECT current_database() as database, current_user as user`;
    
    console.log('\nConnection successful! Database details:');
    console.log(`- Connected to database: ${result[0].database}`);
    console.log(`- Connected as user: ${result[0].user}`);
    
    // Check database tables
    console.log('\nFetching table information:');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (tables.length > 0) {
      console.log(`Found ${tables.length} tables:`);
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('No tables found in the public schema.');
    }
    
    console.log('\n✅ Neon database connection is working correctly!');
  } catch (error) {
    console.error('\n❌ Neon database connection test failed:');
    console.error(error);
    
    process.exit(1);
  }
}

checkNeonConnection();
