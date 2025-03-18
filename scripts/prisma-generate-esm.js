#!/usr/bin/env node

// Script to properly generate Prisma client (ES Modules version)
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const projectRoot = path.resolve(__dirname, '..');
const dbPackagePath = path.join(projectRoot, 'packages', 'db');
const prismaSchemaPath = path.join(dbPackagePath, 'prisma', 'schema.prisma');
const envLocalPath = path.join(projectRoot, '.env.local');
const packageDbEnvPath = path.join(dbPackagePath, '.env');

console.log('=== PRISMA GENERATION SCRIPT (ESM VERSION) ===');
console.log(`Project root: ${projectRoot}`);
console.log(`DB package path: ${dbPackagePath}`);
console.log(`Prisma schema path: ${prismaSchemaPath}`);

// Ensure we have environment variables set up correctly
console.log('\nCopying environment variables...');
if (fs.existsSync(envLocalPath)) {
  console.log(`Found .env.local at ${envLocalPath}`);
  try {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    fs.writeFileSync(packageDbEnvPath, envContent);
    console.log(`Copied environment variables to ${packageDbEnvPath}`);
  } catch (error) {
    console.error('Error copying environment variables:', error.message);
  }
} else {
  console.error('.env.local file not found. Will try to continue with existing .env file.');
}

// Change to the db package directory
console.log('\nChanging to db package directory...');
const originalDir = process.cwd();
process.chdir(dbPackagePath);
console.log(`Current directory: ${process.cwd()}`);

// Run prisma generate
console.log('\nRunning prisma generate...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Error generating Prisma client:', error.message);
}

// Now run prisma db push with some debug information
console.log('\nNow attempting prisma db push...');
try {
  // Just show the DATABASE_URL for debugging (masking the password)
  const envPath = path.join(dbPackagePath, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const dbUrlMatch = envContent.match(/DATABASE_URL=([^\n]+)/);
    if (dbUrlMatch) {
      const dbUrl = dbUrlMatch[1];
      const maskedDbUrl = dbUrl.replace(/:[^:]*@/, ':****@');
      console.log(`Using DATABASE_URL: ${maskedDbUrl}`);
    } else {
      console.error('DATABASE_URL not found in .env file');
    }
  } else {
    console.error('.env file not found in db package directory');
  }
  
  console.log('Running prisma db push (this might take a while)...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Error pushing database schema:', error.message);
}

// Return to the original directory
process.chdir(originalDir);
