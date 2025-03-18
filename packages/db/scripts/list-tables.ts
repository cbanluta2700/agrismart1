/**
 * Script to list tables from the Neon PostgreSQL database
 */

import { getSql } from '../src/neon-db';

async function listTables() {
  try {
    // Get SQL query function
    const sql = getSql();
    
    // Query to list all tables in the current schema
    const tablesQuery = `
      SELECT 
        table_name 
      FROM 
        information_schema.tables 
      WHERE 
        table_schema = 'public' 
      ORDER BY 
        table_name;
    `;
    
    // Execute the query
    const tables = await sql(tablesQuery);
    
    console.log('Database Tables:')
    console.log('---------------')
    tables.forEach((table: any, index: number) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    return tables.map((t: any) => t.table_name);
  } catch (error) {
    console.error('Error listing tables:', error);
    throw error;
  }
}

async function getTableColumns(tableName: string) {
  try {
    const sql = getSql();
    
    // Query to get column information for a specific table
    const columnsQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable 
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public' 
        AND table_name = $1 
      ORDER BY 
        ordinal_position;
    `;
    
    // Execute the query
    const columns = await sql(columnsQuery, [tableName]);
    
    console.log(`\nColumns for ${tableName}:`);
    console.log('------------------------');
    columns.forEach((col: any) => {
      console.log(`${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    return columns;
  } catch (error) {
    console.error(`Error getting columns for ${tableName}:`, error);
    throw error;
  }
}

async function getTableRowCount(tableName: string) {
  try {
    const sql = getSql();
    
    // Query to count rows in a table
    const countQuery = `SELECT COUNT(*) FROM "${tableName}";`;
    
    // Execute the query
    const result = await sql(countQuery);
    const count = parseInt(result[0].count, 10);
    
    console.log(`\nRow count for ${tableName}: ${count}`);
    
    return count;
  } catch (error) {
    console.error(`Error counting rows for ${tableName}:`, error);
    return 0; // Return 0 if there's an error
  }
}

async function sampleTableData(tableName: string, limit = 5) {
  try {
    const sql = getSql();
    
    // Query to get sample data from a table
    const sampleQuery = `SELECT * FROM "${tableName}" LIMIT ${limit};`;
    
    // Execute the query
    const samples = await sql(sampleQuery);
    
    console.log(`\nSample data from ${tableName} (${samples.length} rows):`);
    console.log('-------------------------');
    samples.forEach((row: any) => {
      console.log(JSON.stringify(row, null, 2));
    });
    
    return samples;
  } catch (error) {
    console.error(`Error sampling data from ${tableName}:`, error);
    return [];
  }
}

async function main() {
  try {
    // List all tables
    const tables = await listTables();
    
    // Community-related tables
    const communityTables = tables.filter(t => 
      ['organization', 'organization_member', 'forum', 'topic', 'comment', 'group', 'group_member'].includes(t)
    );
    
    console.log('\nCommunity-related tables:', communityTables);
    
    // Resource-related tables
    const resourceTables = tables.filter(t => 
      ['article', 'course', 'lesson', 'course_enrollment', 'documentation'].includes(t)
    );
    
    console.log('\nResource-related tables:', resourceTables);
    
    // Examine structure and content of key tables
    for (const table of [...communityTables, ...resourceTables]) {
      await getTableColumns(table);
      await getTableRowCount(table);
      
      // Get sample data if table has rows
      const count = await getTableRowCount(table);
      if (count > 0) {
        await sampleTableData(table);
      }
    }
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main();
