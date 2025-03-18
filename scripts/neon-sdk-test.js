#!/usr/bin/env bun

// Test Neon PostgreSQL connection using recommended settings
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Get connection string from environment variables
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error('No DATABASE_URL or POSTGRES_URL found in environment variables');
  process.exit(1);
}

console.log(`Connection string: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

// Configure pool with recommended Neon settings
const pool = new Pool({
  connectionString,
  ssl: {
    require: true,
    rejectUnauthorized: true,
  },
  max: 5, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection not established
});

// Add event listeners to the pool for better diagnostics
pool.on('connect', (client) => {
  console.log('New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect to Neon PostgreSQL...');
    client = await pool.connect();
    console.log('Connected successfully!');
    
    console.log('Running test query...');
    const result = await client.query('SELECT current_database() as database, current_user as user, version() as version');
    console.log('Query results:', result.rows[0]);
    
    // Try to list available tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('\nAvailable tables:');
      tablesResult.rows.forEach((row) => {
        console.log(`- ${row.table_name}`);
      });
    } else {
      console.log('\nNo tables found in the public schema');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:');
    console.error(error);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\nDNS resolution failed. Check if the hostname is correct.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nConnection refused. Check if the database server is running and accepting connections.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\nConnection timed out. This could be due to:');
      console.error('- Network connectivity issues');
      console.error('- Firewall blocking the connection');
      console.error('- The database server is down or not responding');
    } else if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
      console.error('\nSSL certificate validation failed. The server is using a self-signed certificate.');
    } else {
      console.error('\nNetworking or authentication issues. Please check:');
      console.error('1. Your connection string details (username, password, host, port)');
      console.error('2. IP allowlist in Neon dashboard');
      console.error('3. Database server status in Neon dashboard');
      console.error('4. Network connectivity and firewall settings');
    }
    
    return false;
  } finally {
    if (client) {
      client.release();
      console.log('Client connection released');
    }
    
    // Close the pool
    await pool.end();
    console.log('Connection pool closed');
  }
}

testConnection().catch(console.error);
