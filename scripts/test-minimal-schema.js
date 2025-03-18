#!/usr/bin/env bun

// Script to test a minimalist schema with Prisma
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Setup paths
const projectRoot = process.cwd();
const testDir = path.join(projectRoot, 'prisma-test');
const prismaDir = path.join(testDir, 'prisma');

console.log('=== MINIMAL PRISMA SCHEMA TEST ===');

// Create test directory
console.log('Creating test directory structure...');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

// Copy environment variables
console.log('Copying environment variables...');
const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  fs.writeFileSync(path.join(testDir, '.env'), envContent);
  console.log('Environment variables copied');
} else {
  console.error('Missing .env.local file');
  process.exit(1);
}

// Create a minimal schema
console.log('Creating minimal Prisma schema...');
const minimalSchema = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model TestTable {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
}
`;

fs.writeFileSync(path.join(prismaDir, 'schema.prisma'), minimalSchema);
console.log('Minimal schema created');

// Create package.json
console.log('Creating package.json...');
const packageJson = {
  name: "prisma-test",
  version: "1.0.0",
  main: "index.js",
  dependencies: {
    "prisma": "^5.9.1",
    "@prisma/client": "^5.9.1"
  },
  scripts: {
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "test": "node test.js"
  }
};

fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));
console.log('Package.json created');

// Create simple test script
console.log('Creating test script...');
const testScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing connection...');
    
    // Create a test record
    const created = await prisma.testTable.create({
      data: {
        name: 'Test Entry ' + new Date().toISOString()
      }
    });
    
    console.log('Created test record:', created);
    
    // Fetch all records
    const allRecords = await prisma.testTable.findMany();
    console.log('All records:', allRecords);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
`;

fs.writeFileSync(path.join(testDir, 'test.js'), testScript);
console.log('Test script created');

// Change to test directory and run commands
console.log('\nChanging to test directory and installing dependencies...');
process.chdir(testDir);
console.log(`Current directory: ${process.cwd()}`);

try {
  console.log('Installing dependencies...');
  execSync('bun install', { stdio: 'inherit' });
  
  console.log('\nPushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\nGenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\nRunning test script...');
  execSync('node test.js', { stdio: 'inherit' });
  
  console.log('\n=== Test completed successfully! ===');
  console.log('The minimal schema test was successful. This indicates that:');
  console.log('1. Basic Prisma connectivity to Neon PostgreSQL works');
  console.log('2. Schema push functionality is operational');
  console.log('3. The database can accept and store data');
  console.log('\nIf your main schema push is still failing, the issue may be with:');
  console.log('- Complex schema structures or relations');
  console.log('- Specific model definitions');
  console.log('- Schema versioning or migrations');
} catch (error) {
  console.error('\n=== Test failed ===');
  console.error('Error:', error.message);
  console.error('\nEven the minimal schema test failed, which suggests:');
  console.error('1. There may be fundamental connectivity issues');
  console.error('2. Database credentials or permissions may be incorrect');
  console.error('3. The Neon database may have configuration restrictions');
}
