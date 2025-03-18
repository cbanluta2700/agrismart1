#!/usr/bin/env bun

// Improved Vercel PostgreSQL connection test
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Make sure @vercel/postgres is installed
try {
  execSync('bun add @vercel/postgres', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to install @vercel/postgres:', error);
}

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Import sql after environment variables are loaded
const { sql } = require('@vercel/postgres');

// Display connection info
console.log('\n=== VERCEL POSTGRES CONNECTION TEST ===\n');
console.log('Using Vercel Postgres client to connect to Neon PostgreSQL');

const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!pgUrl) {
  console.error('No POSTGRES_URL or DATABASE_URL found in environment variables');
  process.exit(1);
}

console.log(`Connection URL: ${pgUrl.replace(/:[^:]*@/, ':****@')}`);

async function testVercelPostgres() {
  try {
    console.log('\nAttempting to connect...');
    const startTime = Date.now();
    
    // Test basic connection
    const result = await sql`SELECT current_database() as database, current_user as user, version() as version`;
    const elapsed = Date.now() - startTime;
    
    console.log(`\nConnection successful! (${elapsed}ms)`);
    console.log('\nDatabase Information:');
    console.log(`- Database: ${result.rows[0].database}`);
    console.log(`- User: ${result.rows[0].user}`);
    console.log(`- Version: ${result.rows[0].version}`);
    
    // List tables in the public schema
    try {
      console.log('\nListing tables in the public schema:');
      const tablesResult = await sql`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_type, table_name
      `;
      
      if (tablesResult.rows.length === 0) {
        console.log('No tables found in the public schema.');
      } else {
        console.log('Tables:');
        tablesResult.rows.forEach(row => {
          console.log(`- ${row.table_name} (${row.table_type})`);
        });
      }
    } catch (error) {
      console.error('Error listing tables:', error.message);
    }
    
    // Test query with parameters
    try {
      console.log('\nTesting parameterized query:');
      const testParam = 'test';
      const paramResult = await sql`SELECT ${testParam} as test_parameter`;
      console.log(`Parameter test successful: ${paramResult.rows[0].test_parameter}`);
    } catch (error) {
      console.error('Error with parameterized query:', error.message);
    }
    
    return true;
  } catch (error) {
    console.error('\nConnection failed:');
    console.error(error);
    
    console.error('\nTroubleshooting steps:');
    console.error('1. Verify your POSTGRES_URL/DATABASE_URL environment variable');
    console.error('2. Check if the Neon database is active');
    console.error('3. Ensure your IP is allowed in Neon\'s connection settings');
    console.error('4. Test if you can connect using psql from the command line');
    console.error('5. See docs/neon-troubleshooting.md for more details');
    
    return false;
  }
}

testVercelPostgres()
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
