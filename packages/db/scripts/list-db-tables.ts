/**
 * Script to list tables from the Neon PostgreSQL database
 * Using the standard Neon Serverless approach
 */

import { neon } from "@neondatabase/serverless";

// Function to get all tables in the database
async function getDbTables() {
  // Initialize the SQL client
  const sql = neon(process.env.DATABASE_URL!);
  
  // Query to list all tables
  const tables = await sql`
    SELECT 
      table_name 
    FROM 
      information_schema.tables 
    WHERE 
      table_schema = 'public' 
    ORDER BY 
      table_name;
  `;
  
  console.log('\n=== DATABASE TABLES ===');
  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table.table_name}`);
  });
  
  return tables.map(t => t.table_name);
}

// Function to get table columns
async function getTableColumns(tableName: string) {
  const sql = neon(process.env.DATABASE_URL!);
  
  const columns = await sql`
    SELECT 
      column_name, 
      data_type, 
      is_nullable 
    FROM 
      information_schema.columns 
    WHERE 
      table_schema = 'public' 
      AND table_name = ${tableName} 
    ORDER BY 
      ordinal_position;
  `;
  
  console.log(`\n=== COLUMNS FOR ${tableName.toUpperCase()} ===`);
  columns.forEach(col => {
    console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
  });
  
  return columns;
}

// Function to count rows in a table
async function getTableRowCount(tableName: string) {
  const sql = neon(process.env.DATABASE_URL!);
  
  // Need to use dynamic table name in a safe way
  const result = await sql`SELECT COUNT(*) FROM "${tableName}"`;
  const count = parseInt(result[0].count, 10);
  
  console.log(`Total rows: ${count}`);
  
  return count;
}

// Function to get sample data from a table
async function getTableSampleData(tableName: string, limit = 3) {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    // Use dynamic table name in a safe way
    const data = await sql`SELECT * FROM "${tableName}" LIMIT ${limit}`;
    
    if (data.length > 0) {
      console.log(`\n=== SAMPLE DATA FROM ${tableName.toUpperCase()} ===`);
      data.forEach((row, index) => {
        console.log(`--- Row ${index + 1} ---`);
        console.log(JSON.stringify(row, null, 2));
      });
    }
    
    return data;
  } catch (error) {
    console.error(`Error getting sample data from ${tableName}:`, error);
    return [];
  }
}

// Main function to examine community and resource tables
async function main() {
  try {
    // Get all tables
    const allTables = await getDbTables();
    
    // Define community and resource related tables
    const communityTables = [
      'Organization',
      'OrganizationMember',
      'Forum',
      'Topic',
      'Comment',
      'Group',
      'GroupMember',
      'GroupPost',
      'Conversation',
      'ConversationParticipant',
      'Message',
      'MessageReaction',
      'Notification'
    ];
    
    const resourceTables = [
      'Article',
      'Course',
      'Lesson',
      'CourseEnrollment',
      'Documentation'
    ];
    
    // Filter existing tables
    const existingCommunityTables = allTables.filter(t => communityTables.includes(t));
    const existingResourceTables = allTables.filter(t => resourceTables.includes(t));
    
    console.log('\n=== COMMUNITY TABLES ===');
    console.log(existingCommunityTables.join(', '));
    
    console.log('\n=== RESOURCE TABLES ===');
    console.log(existingResourceTables.join(', '));
    
    // Examine community tables
    console.log('\n======= COMMUNITY TABLES DETAILS =======');
    for (const tableName of existingCommunityTables) {
      console.log(`\n>> Examining table: ${tableName}`);
      await getTableColumns(tableName);
      await getTableRowCount(tableName);
      await getTableSampleData(tableName);
    }
    
    // Examine resource tables
    console.log('\n======= RESOURCE TABLES DETAILS =======');
    for (const tableName of existingResourceTables) {
      console.log(`\n>> Examining table: ${tableName}`);
      await getTableColumns(tableName);
      await getTableRowCount(tableName);
      await getTableSampleData(tableName);
    }
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
});
