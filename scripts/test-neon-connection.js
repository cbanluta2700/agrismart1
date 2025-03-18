// Test Neon database connection with the serverless driver
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
const rootDir = path.resolve(__dirname, '../');
dotenv.config({ path: path.join(rootDir, '.env') });

async function testNeonConnection() {
  console.log('=== NEON DATABASE CONNECTION TEST ===\n');
  
  // Check for database URL
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
  if (!dbUrl) {
    console.error('❌ No database URL found in environment variables');
    return false;
  }
  
  console.log(`Using connection: ${dbUrl.replace(/:[^:]*@/, ':****@')}\n`);
  
  try {
    // Use the Neon serverless driver
    const sql = neon(dbUrl);
    
    // Test simple query
    const result = await sql`SELECT current_database() as db_name, current_user as user_name`;
    console.log('✅ Connected to Neon PostgreSQL database successfully');
    console.log(`Database: ${result[0].db_name}, User: ${result[0].user_name}\n`);
    
    // Check for tables
    console.log('=== DATABASE TABLES ===');
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tablesResult.length === 0) {
      console.log('No tables found in the database.');
    } else {
      console.log(`Found ${tablesResult.length} tables:`);
      tablesResult.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
      
      // Check for chat-related tables
      console.log('\n=== CHAT SYSTEM TABLES ===');
      const chatTables = ['conversation', 'message', 'conversationparticipant', 'notification', 'messageattachment', 'messagereaction'];
      const foundChatTables = tablesResult.filter(row => 
        chatTables.includes(row.table_name.toLowerCase())
      );
      
      if (foundChatTables.length === 0) {
        console.log('❌ No chat-related tables found. You may need to run Prisma migrations.');
      } else {
        console.log(`Found ${foundChatTables.length} chat-related tables:`);
        for (const tableRow of foundChatTables) {
          const tableName = tableRow.table_name;
          console.log(`\n--- TABLE: ${tableName} ---`);
          
          // Get table columns
          const columnsResult = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = ${tableName}
            ORDER BY ordinal_position
          `;
          
          console.log('Columns:');
          columnsResult.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
            const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
            console.log(`  ${col.column_name}: ${col.data_type} ${nullable} ${defaultVal}`.trim());
          });
          
          // Only show foreign keys for brevity
          const fkResult = await sql`
            SELECT
              kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = ${tableName}
          `;
          
          if (fkResult.length > 0) {
            console.log('\nForeign Keys:');
            fkResult.forEach(fk => {
              console.log(`  ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            });
          }
        }
      }
      
      // Check for thread reply support in Message table
      if (foundChatTables.some(row => row.table_name.toLowerCase() === 'message')) {
        console.log('\n=== THREAD REPLY SUPPORT CHECK ===');
        const messageColumns = await sql`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'Message'
        `;
        
        const columnNames = messageColumns.map(col => col.column_name.toLowerCase());
        const hasIsReplyToId = columnNames.includes('isreplytoid');
        const hasReplyCount = columnNames.includes('replycount');
        
        console.log(`isReplyToId column: ${hasIsReplyToId ? '✅ Present' : '❌ Missing'}`);
        console.log(`replyCount column: ${hasReplyCount ? '✅ Present' : '❌ Missing'}`);
        
        if (!hasIsReplyToId || !hasReplyCount) {
          console.log('\n❌ Thread reply columns are missing. Schema update required.');
        } else {
          console.log('\n✅ Message table has proper thread reply support!');
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Neon database:', error.message);
    if (error.message.includes('role') || error.message.includes('password')) {
      console.log('\nPossible authentication issues. Check your connection string credentials.');
    } else if (error.message.includes('connect') || error.message.includes('timeout')) {
      console.log('\nConnection error. Check if the Neon database is active and accessible.');
      console.log('Note: Neon databases may pause when inactive. Check the Neon dashboard to activate it.');
    }
    return false;
  }
}

// Execute the function
testNeonConnection().then(success => {
  if (success) {
    console.log('\n=== SUMMARY ===');
    console.log('✅ Database connection test completed successfully');
    console.log('\nNext steps:');
    console.log('1. Run Prisma schema push: bun prisma db push');
    console.log('2. Generate Prisma client: bun prisma generate');
  } else {
    console.error('\n❌ Database connection test failed');
    process.exit(1);
  }
});
