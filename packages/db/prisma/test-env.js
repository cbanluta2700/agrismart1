// Load environment variables
require('dotenv').config();

// Print the database URL (with password masked for security)
const dbUrl = process.env.DATABASE_URL || '';
console.log(`DATABASE_URL: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);

// Check if other environment variables are available
console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✓ Set' : '✗ Not set');
console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL ? '✓ Set' : '✗ Not set');
