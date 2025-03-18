/**
 * Script to test the authentication schema
 */

const { neon } = require('@neondatabase/serverless');
const { v4: uuidv4 } = require('uuid');

// Get database connection string
const connectionUrl = process.env.DATABASE_URL || '';
console.log(`Database connection: ${connectionUrl.includes('neon.tech') ? 'Neon PostgreSQL' : 'PostgreSQL'}`);
console.log(`Connection URL: ${connectionUrl.replace(/:[^:]*@/, ':****@')}`);

// Create SQL executor
const sql = neon(connectionUrl);

async function testAuth() {
  try {
    // Create a test user
    const userId = uuidv4();
    const email = `test-${Math.floor(Math.random() * 10000)}@example.com`;
    
    console.log(`Creating test user with ID: ${userId} and email: ${email}`);
    
    await sql`
      INSERT INTO "User" (id, name, email, "emailVerified", image)
      VALUES (${userId}, 'Test User', ${email}, NULL, NULL)
    `;
    
    // Verify user was created
    const user = await sql`SELECT * FROM "User" WHERE id = ${userId}`;
    console.log('Created user:', user[0]);
    
    // Test retrieving all users
    const allUsers = await sql`SELECT id, name, email FROM "User"`;
    console.log('\nAll users:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Execute the script
testAuth()
  .then(success => {
    console.log(success ? '\nu2705 Auth test completed successfully!' : '\nu274c Auth test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
