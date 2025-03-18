#!/usr/bin/env bun

/**
 * Comprehensive Neon PostgreSQL Connection Test Script
 * Tests multiple connection methods for Neon PostgreSQL
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Install required dependencies if they don't exist
console.log('Installing required dependencies...');
try {
  execSync('bun add -d @vercel/postgres pg postgres @prisma/client prisma', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (e) {
  console.error('Failed to install dependencies:', e);
  process.exit(1);
}

// Import libraries after installation
const { sql } = require('@vercel/postgres');
const { Pool } = require('pg');
const postgres = require('postgres');

// Generate Prisma client if it doesn't exist
try {
  execSync('cd packages/db && bun prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully');
} catch (e) {
  console.error('Failed to generate Prisma client:', e);
}

// Create Postgres.js client
const postgresJsClient = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL, {
  ssl: 'verify-full',
  idle_timeout: 20,
  connect_timeout: 10
});

// Create a node-pg pool
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: true, // Set to false if using self-signed certificates
  },
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

// Test @vercel/postgres connection
async function testVercelPostgres() {
  console.log('\n========== @VERCEL/POSTGRES TEST ==========');
  console.log('Testing connection with @vercel/postgres...');
  try {
    const startTime = Date.now();
    const result = await sql`SELECT current_database() as database, current_user as user, version() as version`;
    const elapsed = Date.now() - startTime;
    
    console.log(`Connection successful (${elapsed}ms)! ✅`);
    console.log('Database Info:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Connection failed ❌');
    console.error('Error:', error.message);
    return false;
  }
}

// Test postgres.js connection
async function testPostgresJs() {
  console.log('\n========== POSTGRES.JS TEST ==========');
  console.log('Testing connection with postgres.js...');
  try {
    const startTime = Date.now();
    const result = await postgresJsClient`SELECT current_database() as database, current_user as user, version() as version`;
    const elapsed = Date.now() - startTime;
    
    console.log(`Connection successful (${elapsed}ms)! ✅`);
    console.log('Database Info:', result[0]);
    return true;
  } catch (error) {
    console.error('Connection failed ❌');
    console.error('Error:', error.message);
    return false;
  } finally {
    await postgresJsClient.end();
  }
}

// Test node-pg connection
async function testNodePg() {
  console.log('\n========== NODE-PG TEST ==========');
  console.log('Testing connection with node-pg...');
  
  let client;
  try {
    const startTime = Date.now();
    client = await pgPool.connect();
    const result = await client.query('SELECT current_database() as database, current_user as user, version() as version');
    const elapsed = Date.now() - startTime;
    
    console.log(`Connection successful (${elapsed}ms)! ✅`);
    console.log('Database Info:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Connection failed ❌');
    console.error('Error:', error.message);
    return false;
  } finally {
    if (client) client.release();
    await pgPool.end();
  }
}

// Test Prisma connection
async function testPrisma() {
  console.log('\n========== PRISMA TEST ==========');
  console.log('Testing connection with Prisma...');
  
  try {
    // Dynamically import PrismaClient to avoid errors if prisma generate hasn't been run
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT current_database() as database, current_user as user, version() as version`;
    const elapsed = Date.now() - startTime;
    
    console.log(`Connection successful (${elapsed}ms)! ✅`);
    console.log('Database Info:', result[0]);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('Connection failed ❌');
    console.error('Error:', error.message);
    console.error('Note: If you see "P1014: The underlying Prisma Database Engine was terminated", run "bun prisma generate" first');
    return false;
  }
}

// Print connection strings (masked)
function printConnectionInfo() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  const maskedUrl = dbUrl?.replace(/:[^:]*@/, ':****@') || 'not defined';
  
  console.log('\n========== CONNECTION INFO ==========');
  console.log(`Database URL: ${maskedUrl}`);
  console.log(`SSL mode: ${dbUrl?.includes('sslmode=require') ? 'enabled (sslmode=require)' : 'not specified'}`);
}

// Run all tests
async function runAllTests() {
  printConnectionInfo();
  
  const results = [];
  
  results.push({ name: '@vercel/postgres', success: await testVercelPostgres() });
  results.push({ name: 'postgres.js', success: await testPostgresJs() });
  results.push({ name: 'node-pg', success: await testNodePg() });
  results.push({ name: 'Prisma', success: await testPrisma() });
  
  console.log('\n========== TEST SUMMARY ==========');
  for (const result of results) {
    console.log(`${result.name}: ${result.success ? '✅ SUCCESSFUL' : '❌ FAILED'}`);
  }
  
  // Make recommendations based on results
  console.log('\n========== RECOMMENDATIONS ==========');
  const successfulTests = results.filter(r => r.success);
  
  if (successfulTests.length === 0) {
    console.log('❌ All connection methods failed. Please check:');
    console.log('  1. Your database is running and accessible');
    console.log('  2. Your connection string is correct');
    console.log('  3. SSL configuration is properly set');
    console.log('  4. IP restrictions on Neon PostgreSQL allow your connections');
  } else if (successfulTests.length < results.length) {
    console.log('⚠️ Some connection methods succeeded while others failed.');
    console.log('Recommended method(s) to use:');
    for (const result of successfulTests) {
      console.log(`  - ${result.name}`);
    }
  } else {
    console.log('✅ All connection methods succeeded!');
    console.log('You can choose any of these methods based on your preference:');
    console.log('  1. @vercel/postgres - Good for Vercel deployments');
    console.log('  2. postgres.js - Modern, Promise-based API');
    console.log('  3. node-pg - Traditional PostgreSQL client');
    console.log('  4. Prisma - Full ORM capabilities');
  }
}

runAllTests().catch(console.error);
