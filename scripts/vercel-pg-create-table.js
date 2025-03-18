#!/usr/bin/env bun

// Create test table using Vercel PostgreSQL client
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
console.log('\n=== VERCEL POSTGRES TABLE CREATION TEST ===\n');
console.log('Using Vercel Postgres client to connect to Neon PostgreSQL');

const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!pgUrl) {
  console.error('No POSTGRES_URL or DATABASE_URL found in environment variables');
  process.exit(1);
}

console.log(`Connection URL: ${pgUrl.replace(/:[^:]*@/, ':****@')}`);

async function testTableCreation() {
  try {
    console.log('\nAttempting to connect...');
    
    // Test connection
    console.log('Testing basic connection...');
    const result = await sql`SELECT current_database() as database, current_user as user, version() as version`;
    console.log(`Connected to ${result.rows[0].database} as ${result.rows[0].user}`);
    
    // List existing tables
    console.log('\nListing existing tables...');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (tablesResult.rows.length > 0) {
      console.log('Existing tables:');
      tablesResult.rows.forEach((row) => {
        console.log(`- ${row.table_name}`);
      });
    } else {
      console.log('No tables found in the public schema');
    }
    
    // Create a test table
    console.log('\nCreating test table...');
    await sql`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Test table created successfully');
    
    // Insert a test row
    console.log('\nInserting test data...');
    const insertResult = await sql`
      INSERT INTO test_table (name) VALUES ('Test Entry') RETURNING id, name, created_at
    `;
    console.log(`Inserted row: ID=${insertResult.rows[0].id}, Name=${insertResult.rows[0].name}, Created=${insertResult.rows[0].created_at}`);
    
    // Query the data
    console.log('\nQuerying test data...');
    const queryResult = await sql`SELECT * FROM test_table`;
    console.log('Query results:');
    queryResult.rows.forEach((row) => {
      console.log(`- ID: ${row.id}, Name: ${row.name}, Created: ${row.created_at}`);
    });
    
    return true;
  } catch (error) {
    console.error('\nError during table creation test:');
    console.error(error);
    
    return false;
  }
}

testTableCreation()
  .then(success => {
    if (success) {
      console.log('\nTable creation test PASSED!');
      console.log('This confirms that:');
      console.log('1. The database connection is working correctly');
      console.log('2. You have permission to create tables and insert data');
      console.log('3. The database is operational');
    } else {
      console.log('\nTable creation test FAILED!');
      console.log('Review the error message above for details.');
    }
  })
  .catch(console.error);
