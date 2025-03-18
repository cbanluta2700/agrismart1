#!/usr/bin/env bun

// Direct connection test using pg
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Connection string with explicit SSL parameters
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
console.log(`Using connection string: ${connectionString?.replace(/:[^:]*@/, ':****@')}`);

// Create client with explicit SSL options
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: true, // Set to false for self-signed certificates
  },
  connectionTimeoutMillis: 10000, // 10 seconds
});

async function testConnection() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');
    
    const result = await client.query('SELECT current_database() as database, current_user as user, version() as version');
    console.log('Database information:', result.rows[0]);
    
    console.log('Connection test completed successfully');
  } catch (error) {
    console.error('Connection failed:');
    console.error(error);
    
    // Provide helpful error details
    if (error.code === 'ENOTFOUND') {
      console.error('DNS resolution failed. Check if the hostname is correct.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Check if the database server is running and accepting connections.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. Check network connectivity and firewall rules.');
    } else if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
      console.error('SSL certificate validation failed. Try setting rejectUnauthorized: false if using self-signed certificate.');
    }
  } finally {
    await client.end();
  }
}

testConnection();
