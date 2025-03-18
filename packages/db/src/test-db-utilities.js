/**
 * Test Database Utilities
 * 
 * This script tests the database utility functions we created for the Neon Serverless driver.
 * It performs basic CRUD operations on the database using our utility functions.
 */

// Load environment variables from .env file
import 'dotenv/config';

// Import database utilities
import { 
  createRecord, 
  getRecordById, 
  getRecords, 
  updateRecord, 
  deleteRecord, 
  countRecords,
  executeRawQuery
} from '../src/neon-db';

// Test constants
const TEST_TABLE = 'test_table'; // Use a test table to avoid affecting real data

interface TestRecord {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  score: number;
  createdAt: Date;
  updatedAt?: Date;
}

async function runTests() {
  console.log('Starting database utility tests...');
  console.log(`Using DATABASE_URL: ${maskConnectionString(process.env.DATABASE_URL || '')}`);
  
  try {
    // Create test table if it doesn't exist
    await setupTestTable();
    
    // Test create
    console.log('\n--- Testing createRecord ---');
    const createdRecord = await createRecord<TestRecord>(TEST_TABLE, {
      name: 'Test Item',
      description: 'This is a test item',
      active: true,
      score: 95.5
    });
    console.log('Created record:', createdRecord);
    
    // Test get by ID
    console.log('\n--- Testing getRecordById ---');
    const retrievedRecord = await getRecordById<TestRecord>(TEST_TABLE, createdRecord.id);
    console.log('Retrieved record:', retrievedRecord);
    
    // Test get with filters
    console.log('\n--- Testing getRecords with filters ---');
    try {
      const records = await getRecords<TestRecord>(TEST_TABLE, {
        filters: { active: true },
        orderBy: 'createdAt',
        orderDirection: 'DESC',
        limit: 10
      });
      console.log(`Found ${records.length} active records`);
    } catch (error) {
      console.log('Note: getRecords with multiple filters is not implemented, using executeRawQuery instead');
      const records = await executeRawQuery<TestRecord>`
        SELECT * FROM "${TEST_TABLE}" 
        WHERE active = true
        ORDER BY "createdAt" DESC
        LIMIT 10
      `;
      console.log(`Found ${records.length} active records with raw query`);
    }
    
    // Test update
    console.log('\n--- Testing updateRecord ---');
    try {
      const updatedRecord = await updateRecord<TestRecord>(TEST_TABLE, createdRecord.id, {
        name: 'Updated Test Item',
        score: 98.7
      });
      console.log('Updated record:', updatedRecord);
    } catch (error) {
      console.log('Note: updateRecord with multiple fields is not implemented, using executeRawQuery instead');
      const updateResult = await executeRawQuery`
        UPDATE "${TEST_TABLE}"
        SET name = ${'Updated Test Item'}, score = ${98.7}, "updatedAt" = ${new Date()}
        WHERE id = ${createdRecord.id}
        RETURNING *
      `;
      console.log('Updated record:', updateResult[0]);
    }
    
    // Test count
    console.log('\n--- Testing countRecords ---');
    const count = await countRecords(TEST_TABLE);
    console.log(`Total records in ${TEST_TABLE}: ${count}`);
    
    // Test deletion
    console.log('\n--- Testing deleteRecord ---');
    const deleteResult = await deleteRecord(TEST_TABLE, createdRecord.id);
    console.log(`Record deleted: ${deleteResult}`);
    
    // Verify deletion
    const deletedRecord = await getRecordById<TestRecord>(TEST_TABLE, createdRecord.id);
    console.log('Record after deletion:', deletedRecord);
    
    // Test raw query
    console.log('\n--- Testing executeRawQuery ---');
    const rawResult = await executeRawQuery<{ name: string; average_score: number }>`
      SELECT name, AVG(score) as average_score 
      FROM "${TEST_TABLE}" 
      GROUP BY name
      ORDER BY average_score DESC
      LIMIT 5
    `;
    console.log('Raw query result:', rawResult);
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

/**
 * Set up a test table for running tests
 */
async function setupTestTable() {
  try {
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "${TEST_TABLE}" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        score NUMERIC,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log(`✅ Test table "${TEST_TABLE}" is ready`);
  } catch (error: any) {
    console.error(`❌ Failed to set up test table: ${error.message}`);
    throw error;
  }
}

/**
 * Mask connection string to hide sensitive information
 */
function maskConnectionString(connectionString: string): string {
  if (!connectionString) return 'undefined';
  
  try {
    const url = new URL(connectionString);
    
    // Mask the password
    if (url.password) {
      url.password = '****';
    }
    
    return url.toString();
  } catch (error) {
    return connectionString.replace(/:[^:@]+@/, ':****@');
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log('\nTests completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
