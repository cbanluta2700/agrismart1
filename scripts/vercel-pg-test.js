#!/usr/bin/env bun

// Test script for Neon PostgreSQL connection using @vercel/postgres
// This is closer to how the application actually uses the database

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try to install @vercel/postgres if it doesn't exist
try {
  require('@vercel/postgres');
} catch (e) {
  console.log('Installing @vercel/postgres...');
  require('child_process').execSync('bun add @vercel/postgres', { stdio: 'inherit' });
}

// Now import it after ensuring it's installed
import { sql } from '@vercel/postgres';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

async function testVercelPostgres() {
  // Get connection string
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined');
    return;
  }
  
  const isNeonDb = connectionString.includes('neon.tech');
  
  console.log(`\n========== VERCEL POSTGRES CONNECTION TEST ==========`);
  console.log(`Connection string: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
  console.log(`Database type: ${isNeonDb ? 'Neon PostgreSQL' : 'Standard PostgreSQL'}`);
  
  try {
    console.log('\nAttempting connection with Vercel Postgres...');
    
    // Test query - this uses the connection string from env vars automatically
    const dbInfoResult = await sql`
      SELECT current_database() as database, 
             current_user as user,
             version() as version
    `;
    
    console.log('Connection successful! ✅');
    console.log('\n--------- Database Information ---------');
    console.table(dbInfoResult.rows[0]);
    
    // Get tables
    const tablesResult = await sql`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    console.log('\n--------- Database Tables ---------');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in the public schema');
    } else {
      console.log(`Found ${tablesResult.rows.length} tables:`);
      console.table(tablesResult.rows);
    }
    
    console.log('\nConnection test completed successfully ✅');
    
  } catch (error) {
    console.error('\nConnection test failed ❌');
    console.error('Error details:', error.message);
    
    console.error('\n========== TROUBLESHOOTING SUGGESTIONS ==========');
    console.error('1. Verify POSTGRES_URL is correctly formatted in your .env.local file');
    console.error('2. Check that the Neon database is active and not in hibernation mode');
    console.error('3. Ensure server firewall allows outbound connections to Neon');
    console.error('4. Check if Vercel Postgres is configured correctly with your Neon database');
    console.error('5. Verify your IP is allowed to connect to the database');
    
    // Additional error details
    if (error.code) {
      console.error(`\nError code: ${error.code}`);
    }
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
  }
}

// Run the test
testVercelPostgres().catch(error => {
  console.error('Unhandled error:', error);
});
