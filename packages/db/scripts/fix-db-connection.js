// Fix database connection for Prisma with Neon Postgres
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// Check if .env file exists
const envPath = path.join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at', envPath);
  process.exit(1);
}

// Create a temp env file with fixed connection URLs for Prisma
const tempEnvPath = path.join(rootDir, '.env.prisma-temp');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract the DATABASE_URL_UNPOOLED for direct schema operations
const unpooledMatch = envContent.match(/DATABASE_URL_UNPOOLED=(.+)/);
if (!unpooledMatch) {
  console.error('DATABASE_URL_UNPOOLED not found in .env file');
  process.exit(1);
}

const unpooledUrl = unpooledMatch[1];
const tempEnvContent = `# Temporary environment file for Prisma
DATABASE_URL=${unpooledUrl}
# Copy all other variables from original .env
${envContent.replace(/^DATABASE_URL=.+$/m, '')}`;

fs.writeFileSync(tempEnvPath, tempEnvContent);

console.log('Created temporary environment file for Prisma with proper connection URL');

// Run Prisma generate with the temp env file
try {
  console.log('Running prisma generate...');
  execSync(`bun prisma generate --schema="${path.join(rootDir, 'packages/db/prisma/schema.prisma')}"`, {
    env: { ...process.env, DATABASE_URL: unpooledUrl },
    stdio: 'inherit'
  });
  
  console.log('Running prisma db push...');
  execSync(`bun prisma db push --schema="${path.join(rootDir, 'packages/db/prisma/schema.prisma')}" --accept-data-loss`, {
    env: { ...process.env, DATABASE_URL: unpooledUrl },
    stdio: 'inherit'
  });
  
  console.log('✅ Database schema updated successfully!');
} catch (error) {
  console.error('Error updating database schema:', error.message);
} finally {
  // Clean up the temporary env file
  fs.unlinkSync(tempEnvPath);
  console.log('Cleaned up temporary environment file');
}
