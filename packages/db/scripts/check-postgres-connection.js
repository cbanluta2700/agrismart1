/**
 * Script to check PostgreSQL connection directly using pg client
 */

// Use native pg module to test direct connection
const { Client } = require('pg');

// Get connection details
const connectionString = process.env.POSTGRES_URL || '';

// Mask password in logs
console.log(`Testing connection to: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

// Create postgres client
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // This might be needed for Neon
  },
});

// Try to connect
async function testConnection() {
  try {
    // Connect to the database
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully to PostgreSQL!');
    
    // Try a simple query
    console.log('Testing query...');
    const res = await client.query('SELECT current_database() as db_name, current_user as username, version() as version');
    console.log('Database info:');
    console.log(JSON.stringify(res.rows[0], null, 2));
    
    // List tables
    console.log('\nChecking existing tables...');
    const tablesRes = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    
    if (tablesRes.rows.length === 0) {
      console.log('No tables found in the database.');
    } else {
      console.log('Tables in database:');
      tablesRes.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Try to run a DDL command to test permissions
    console.log('\nTesting table creation...');
    await client.query('CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())');
    console.log('✅ Test table created successfully!');
    
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err);
    return false;
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

// Run the test
testConnection()
  .then(success => {
    if (!success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
