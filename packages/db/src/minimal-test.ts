/**
 * Minimal Neon Database Test
 * 
 * A very simple test that verifies basic functionality of the Neon database connection.
 */

import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function runMinimalTest() {
  console.log('Running minimal Neon database test...');
  
  try {
    // Initialize the Neon client directly
    const sql = neon(process.env.DATABASE_URL!);
    
    // Test 1: Simple SELECT query
    console.log('\n--- Test 1: Simple SELECT query ---');
    const result = await sql`SELECT 1 as test`;
    console.log('Result:', result);
    
    // Test 2: Query with parameter
    console.log('\n--- Test 2: Query with parameter ---');
    const name = 'Test Name';
    const paramResult = await sql`SELECT ${name} as name`;
    console.log('Parameter result:', paramResult);
    
    console.log('\n✅ Basic connectivity test successful');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run the test
runMinimalTest()
  .then(() => {
    console.log('\nTest completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
