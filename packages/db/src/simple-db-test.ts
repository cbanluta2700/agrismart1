/**
 * Simple Database Test
 * 
 * A simplified test for the Neon database utilities that tests one function at a time.
 */

import 'dotenv/config';
import { executeRawQuery, createRecord, getRecordById } from '../src/neon-db';

// Define test record interface
interface TestRecord {
  id: string;
  name: string;
  value: number;
  createdAt?: Date;
}

// Test constants
const TEST_TABLE = 'test_simple';

async function runSimpleTest() {
  console.log('Starting simplified database test');
  
  try {
    // Step 1: Create test table
    console.log('\n--- Creating test table ---');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "${TEST_TABLE}" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        value INTEGER,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Test table created successfully');
    
    // Step 2: Insert a record using raw query
    console.log('\n--- Testing raw query insert ---');
    const randomValue = Math.floor(Math.random() * 100);
    const rawInsertResult = await executeRawQuery`
      INSERT INTO "${TEST_TABLE}" (id, name, value)
      VALUES (${`test-${Date.now()}`}, ${'Test raw query'}, ${randomValue})
      RETURNING *
    `;
    console.log('Raw insert result:', rawInsertResult[0]);
    
    // Step 3: Insert a record using createRecord
    console.log('\n--- Testing createRecord ---');
    const newRecord = await createRecord<TestRecord>(TEST_TABLE, {
      name: 'Test utility function',
      value: Math.floor(Math.random() * 100)
    });
    console.log('Created record:', newRecord);
    
    // Step 4: Get the record by ID
    console.log('\n--- Testing getRecordById ---');
    const retrievedRecord = await getRecordById<TestRecord>(TEST_TABLE, newRecord.id);
    console.log('Retrieved record:', retrievedRecord);
    
    console.log('\n✅ Simple test completed successfully');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Run the test
runSimpleTest()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
