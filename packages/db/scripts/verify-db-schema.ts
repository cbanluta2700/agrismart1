/**
 * Script to verify and check Neon PostgreSQL database schema
 * Uses the recommended @neondatabase/serverless approach
 */

import { neon } from '@neondatabase/serverless';

// Simple pattern for connecting to Neon PostgreSQL
async function getData() {
  // Use the environment variable for connection
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // Verify connection
    console.log('Verifying database connection...');
    const connectionCheck = await sql`SELECT 1 as connected;`;
    console.log('Connection successful:', connectionCheck[0]);
    
    // Get table information
    console.log('\nRetrieving database tables:');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log(`Found ${tables.length} tables:`);
    for (const table of tables) {
      console.log(`- ${table.table_name}`);
    }
    
    // Check community and resource tables specifically
    console.log('\nChecking community and resource tables:');
    const communityTables = [
      'Organization', 
      'OrganizationMember', 
      'Group', 
      'GroupMember', 
      'Topic', 
      'Comment'
    ];
    
    const resourceTables = [
      'Article', 
      'Course', 
      'Lesson', 
      'Documentation'
    ];
    
    console.log('\nCommunity Tables:');
    for (const tableName of communityTables) {
      try {
        const count = await sql`SELECT COUNT(*) as count FROM "${tableName}";`;
        console.log(`- ${tableName}: ${count[0]?.count || 0} records`);
      } catch (error) {
        console.log(`- ${tableName}: Table not found or error`);
      }
    }
    
    console.log('\nResource Tables:');
    for (const tableName of resourceTables) {
      try {
        const count = await sql`SELECT COUNT(*) as count FROM "${tableName}";`;
        console.log(`- ${tableName}: ${count[0]?.count || 0} records`);
      } catch (error) {
        console.log(`- ${tableName}: Table not found or error`);
      }
    }
    
    // Check if our new UserProfile table exists
    console.log('\nChecking if UserProfile table exists:');
    try {
      const userProfileExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'UserProfile'
        ) as exists;
      `;
      
      if (userProfileExists[0]?.exists) {
        console.log('✓ UserProfile table exists');
        
        // Get column information
        const columns = await sql`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'UserProfile';
        `;
        
        console.log('UserProfile columns:');
        for (const column of columns) {
          console.log(`- ${column.column_name}: ${column.data_type}`);
        }
      } else {
        console.log('✗ UserProfile table does not exist');
      }
    } catch (error) {
      console.log('Error checking UserProfile table:', error);
    }
    
    return tables;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

// Run the function
getData().then(() => {
  console.log('\nDatabase verification complete!');
}).catch(error => {
  console.error('Failed to verify database:', error);
});
