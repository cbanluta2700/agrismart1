/**
 * Script to push a minimal schema to test database connectivity
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log database info
const dbUrl = process.env.POSTGRES_URL || '';
console.log(`Database connection: ${dbUrl.includes('neon.tech') ? 'Neon PostgreSQL' : 'PostgreSQL'}`);
console.log(`Connection URL: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);

try {
  // Path to minimal schema
  const minimalSchemaPath = path.join(__dirname, '..', 'prisma', 'minimal-schema.prisma');
  
  // Ensure the minimal schema exists
  if (!fs.existsSync(minimalSchemaPath)) {
    console.error('Minimal schema file not found:', minimalSchemaPath);
    process.exit(1);
  }
  
  console.log('\nPushing minimal schema to test database connectivity...');
  
  // Run Prisma db push with the minimal schema
  execSync(`npx prisma db push --schema=${minimalSchemaPath} --accept-data-loss`, {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n✅ Successfully pushed minimal schema to database!');
  console.log('Database connection is working correctly.');
} catch (error) {
  console.error('\n❌ Failed to push schema to database:', error.message);
  process.exit(1);
}
