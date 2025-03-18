/**
 * Script to push the Prisma schema to the database using the Neon serverless driver
 * for better connection handling
 */

const { exec } = require('child_process');

// Get connection details
const connectionUrl = process.env.POSTGRES_URL || '';
console.log(`Database connection: ${connectionUrl.includes('neon.tech') ? 'Neon PostgreSQL' : 'PostgreSQL'}`);
console.log(`Connection URL: ${connectionUrl.replace(/:[^:]*@/, ':****@')}`);

// Push schema to database
console.log('\nPushing Prisma schema to database...');

exec('npx prisma db push --accept-data-loss', (error, stdout, stderr) => {
  if (error) {
    console.error(`\n❌ Error executing Prisma DB push: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`\nStderr: ${stderr}`);
  }
  
  console.log(`\n${stdout}`);
  console.log('\n✅ Successfully pushed schema to database!');
  
  // Generate Prisma client
  console.log('\nGenerating Prisma client...');
  
  exec('npx prisma generate', (genError, genStdout, genStderr) => {
    if (genError) {
      console.error(`\n❌ Error generating Prisma client: ${genError.message}`);
      process.exit(1);
    }
    
    if (genStderr) {
      console.error(`\nStderr: ${genStderr}`);
    }
    
    console.log(`\n${genStdout}`);
    console.log('\n✅ Successfully generated Prisma client!');
  });
});
