// Load environment variables from .env file
require('dotenv').config();

const { neon } = require('@neondatabase/serverless');

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  // Log database URL (with masked password)
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    return false;
  }
  console.log(`Using DATABASE_URL: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
  
  try {
    // Create SQL executor
    const sql = neon(dbUrl);
    
    // Test the connection
    const result = await sql`SELECT 1 as test`;
    console.log('Connection successful:', result);
    
    // Check if User table exists
    try {
      const userCheck = await sql`SELECT COUNT(*) FROM "User"`;
      console.log('User table exists, count:', userCheck[0].count);
      
      // Get User table structure
      const userColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'User' AND table_schema = 'public'
      `;
      console.log('User table structure:');
      userColumns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    } catch (err) {
      console.log('User table does not exist yet:', err.message);
    }
    
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Execute the function
testDatabaseConnection()
  .then(success => {
    console.log(success ? '\n✅ Database connection test completed successfully!' : '\n❌ Database connection test failed');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
