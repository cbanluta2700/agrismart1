// Simple script to test connection to Neon PostgreSQL
// Run with: bun run scripts/neon-connection-test.js

import pg from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env.local file
config({ path: '.env.local' });

async function testNeonConnection() {
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('Error: POSTGRES_URL environment variable is not defined');
    process.exit(1);
  }
  
  const isNeonDb = connectionString.includes('neon.tech');
  
  console.log(`Testing connection to ${isNeonDb ? 'Neon PostgreSQL' : 'PostgreSQL'} database`);
  console.log(`Connection string: ${connectionString.replace(/:[^:]*@/, ':****@')}`);
  
  // Configure the client with SSL options
  const clientConfig = {
    connectionString,
    ssl: {
      rejectUnauthorized: false, // For development testing
    }
  };
  
  // Add additional options for Neon if detected
  if (isNeonDb) {
    console.log('Using Neon-specific connection options');
    clientConfig.ssl = {
      rejectUnauthorized: true,
    };
  }
  
  const client = new pg.Client(clientConfig);
  
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Successfully connected to database! ');
    
    // Test query to get database information
    console.log('Executing test query...');
    const result = await client.query(`
      SELECT current_database() as database, 
             current_user as user,
             version() as version
    `);
    
    console.log('\nDatabase Information:');
    console.table(result.rows[0]);
    
    // Get list of tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nDatabase Tables:');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in the database');
    } else {
      tablesResult.rows.forEach((row, i) => {
        console.log(`${i + 1}. ${row.table_name}`);
      });
    }
    
    // Check for Neon-specific features
    if (isNeonDb) {
      try {
        console.log('\nChecking Neon-specific capabilities:');
        const neonResult = await client.query(`SELECT pg_is_in_recovery()`);
        console.log(`Database is in recovery mode: ${neonResult.rows[0].pg_is_in_recovery}`);
      } catch (neonErr) {
        console.log('Could not check Neon-specific capabilities:', neonErr.message);
      }
    }
    
    console.log('\nConnection test completed successfully ');
  } catch (error) {
    console.error('\nConnection test failed ');
    console.error('Error details:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check that the POSTGRES_URL is correctly set in .env.local');
    console.error('2. Make sure the database server is running and accessible');
    console.error('3. For Neon databases, verify your project is active and not in hibernation');
    console.error('4. Check firewall settings allowing outbound connections to port 5432');
    console.error('5. Ensure SSL settings are configured correctly for Neon');
    
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (closeError) {
      // Ignore errors when closing the client
    }
  }
}

// Run the test
testNeonConnection().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
