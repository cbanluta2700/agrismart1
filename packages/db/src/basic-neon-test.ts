/**
 * Basic Neon Database Test
 * 
 * A minimal test that verifies connectivity to the Neon database using
 * the raw query functionality from our neon-db.ts utilities.
 */

import 'dotenv/config';
import { executeRawQuery } from '../src/neon-db';

async function testNeonConnection() {
  console.log('Testing basic Neon database connection...');
  
  try {
    // Test 1: Simple SELECT query
    console.log('\n--- Test 1: Simple SELECT query ---');
    const testQuery = await executeRawQuery`SELECT 1 as number, 'test' as string`;
    console.log('Result:', testQuery);
    
    // Test 2: Create a temporary test table
    console.log('\n--- Test 2: Create temporary table ---');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS temp_test (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Temporary table created');
    
    // Test 3: Insert data with parameters
    console.log('\n--- Test 3: Insert with parameters ---');
    const insertResult = await executeRawQuery`
      INSERT INTO temp_test (name)
      VALUES (${'Test Name'})
      RETURNING *
    `;
    console.log('Insert result:', insertResult);
    
    // Test 4: Select with WHERE clause and parameters
    console.log('\n--- Test 4: Select with parameters ---');
    const selectResult = await executeRawQuery`
      SELECT * FROM temp_test
      WHERE name = ${'Test Name'}
    `;
    console.log('Select result:', selectResult);
    
    console.log('\n✅ All basic tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run the test
testNeonConnection()
  .then(() => {
    console.log('\nTests completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
