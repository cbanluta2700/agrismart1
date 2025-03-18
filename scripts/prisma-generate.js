#!/usr/bin/env bun

// Script to properly generate Prisma client
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define paths
const projectRoot = process.cwd();
const dbPackagePath = path.join(projectRoot, 'packages', 'db');
const prismaSchemaPath = path.join(dbPackagePath, 'prisma', 'schema.prisma');
const envLocalPath = path.join(projectRoot, '.env.local');
const packageDbEnvPath = path.join(dbPackagePath, '.env');

console.log('=== PRISMA GENERATION SCRIPT ===');
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
  console.error('.env.local file not found.');
}

// Change to the db package directory
console.log('\nChanging to db package directory...');
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
  const envContent = fs.readFileSync('.env', 'utf-8');
  const dbUrlMatch = envContent.match(/DATABASE_URL=([^\n]+)/);
  if (dbUrlMatch) {
    const dbUrl = dbUrlMatch[1];
    const maskedDbUrl = dbUrl.replace(/:[^:]*@/, ':****@');
    console.log(`Using DATABASE_URL: ${maskedDbUrl}`);
  } else {
    console.error('DATABASE_URL not found in .env file');
  }
  
  console.log('Running prisma db push (this might take a while)...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Database schema pushed successfully!');
} catch (error) {
  console.error('Error pushing database schema:', error.message);
}
