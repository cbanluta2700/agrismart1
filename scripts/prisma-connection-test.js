#!/usr/bin/env bun

// Test script for Prisma connection to Neon PostgreSQL
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

// Install required dependencies
console.log('Installing required dependencies...');
try {
  execSync('bun add -d @prisma/client prisma', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (e) {
  console.error('Failed to install dependencies:', e);
  process.exit(1);
}

// Now import PrismaClient after installation
const { PrismaClient } = require('@prisma/client');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using process environment');
  dotenv.config();
}

// Create Prisma Client with logs
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.POSTGRES_URL_NON_POOLING
    }
  }
});

async function testPrismaConnection() {
  console.log('\n========== PRISMA CONNECTION TEST ==========');
  console.log('Testing connection to Neon PostgreSQL');
  console.log(`Connection URL: ${process.env.POSTGRES_URL_NON_POOLING?.replace(/:[^:]*@/, ':****@') || 'not defined'}`);
  
  try {
    // Try connecting and running a simple query
    const result = await prisma.$queryRaw`SELECT current_database() as database, current_user as user`;
    console.log('\nConnection successful! ');
    console.log('\nDatabase Info:', result);
    
    // Check if User table exists and count records
    try {
      const userCount = await prisma.user.count();
      console.log(`User table exists! Count: ${userCount}`);
    } catch (error) {
      console.log('User table does not exist or other error:', error.message);
    }
    
    console.log('\nConnection test completed successfully');
  } catch (error) {
    console.error('\nConnection test failed ');
    console.error('Error:', error);
    console.error('\nTroubleshooting suggestions:');
    console.error('1. Verify POSTGRES_URL_NON_POOLING is correctly formatted');
    console.error('2. Check that the Neon database is active');
    console.error('3. Ensure the connection includes proper SSL settings (sslmode=require)');
    console.error('4. Verify your IP is allowed to connect to the database');
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaConnection().catch(console.error);
