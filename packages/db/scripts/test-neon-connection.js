/**
 * Script to test connection to Neon PostgreSQL using the serverless driver
 */

const { neon } = require('@neondatabase/serverless');

// Log database info
const connectionString = process.env.POSTGRES_URL || '';
console.log(`Testing connection to: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

async function testNeonConnection() {
  try {
    // Create SQL function using the neon driver
    const sql = neon(connectionString);
    
    console.log('Testing connection...');
    
    // Execute a simple query
    const result = await sql`SELECT current_database() as db_name, current_user as username, version() as version`;
    console.log('\n✅ Connected successfully to Neon PostgreSQL!');
    console.log('Database info:');
    console.log(JSON.stringify(result[0], null, 2));
    
    // List tables
    console.log('\nChecking existing tables...');
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    
    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      console.log('Tables in database:');
      tables.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Try to create a test table
    console.log('\nTesting table creation...');
    await sql`CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT, created_at TIMESTAMP DEFAULT NOW())`;
    console.log('✅ Test table created successfully!');
    
    // Insert a test row
    console.log('\nInserting test data...');
    await sql`INSERT INTO test_table (name) VALUES ('Test connection ${new Date().toISOString()}')`;
    console.log('✅ Test data inserted successfully!');
    
    // Query the data
    const testData = await sql`SELECT * FROM test_table ORDER BY created_at DESC LIMIT 1`;
    console.log('Latest test data:')
    console.log(JSON.stringify(testData[0], null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Neon connection error:', error);
    return false;
  }
}

// Run the test
testNeonConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
