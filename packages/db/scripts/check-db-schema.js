// Load environment variables
import * as dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
const rootDir = path.resolve(__dirname, '../');
dotenv.config({ path: path.join(rootDir, '.env') });

async function checkDatabaseSchema() {
  console.log('Checking database schema...');
  
  // Log database URL (with masked password)
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    return false;
  }
  console.log(`Using DATABASE_URL: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
  
  try {
    // Create SQL executor using Neon serverless driver
    const sql = neon(dbUrl);
    
    // Test the connection
    const connectionTest = await sql`SELECT 1 as test`;
    console.log('Connection successful:', connectionTest);
    
    // Check what tables exist
    console.log('\n=== TABLES IN DATABASE ===');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('No tables found in the database.');
    } else {
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // For key tables (User, Conversation, Message), check their structure if they exist
    const checkTable = async (tableName) => {
      const tableExists = tables.some(t => t.table_name === tableName);
      if (!tableExists) {
        console.log(`\n=== TABLE ${tableName} DOES NOT EXIST ===`);
        return;
      }
      
      console.log(`\n=== COLUMNS IN ${tableName} TABLE ===`);
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
        ORDER BY ordinal_position
      `;
      
      columns.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}${col.column_default ? ', DEFAULT: ' + col.column_default : ''})`);
      });
      
      // Check for foreign keys
      console.log(`\n=== FOREIGN KEYS IN ${tableName} TABLE ===`);
      const foreignKeys = await sql`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = ${tableName}
          AND tc.table_schema = 'public'
      `;
      
      if (foreignKeys.length === 0) {
        console.log('No foreign keys found.');
      } else {
        foreignKeys.forEach(fk => {
          console.log(`- ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name} (${fk.constraint_name})`);
        });
      }
    };
    
    // Check structure of key tables
    await checkTable('User');
    await checkTable('Conversation');
    await checkTable('Message');
    
    // Check if NotificationType enum exists
    console.log('\n=== CHECKING FOR NotificationType ENUM ===');
    const enumCheck = await sql`
      SELECT EXISTS (
        SELECT FROM pg_type 
        WHERE typname = 'NotificationType'
      ) as exists
    `;
    
    if (enumCheck[0].exists) {
      console.log('NotificationType enum exists. Checking values...');
      const enumValues = await sql`
        SELECT e.enumlabel
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'NotificationType'
      `;
      
      console.log('Enum values:');
      enumValues.forEach(val => {
        console.log(`- ${val.enumlabel}`);
      });
    } else {
      console.log('NotificationType enum does not exist.');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking database schema:', error);
    return false;
  }
}

// Execute the function
checkDatabaseSchema().then(success => {
  if (success) {
    console.log('\n✅ Database schema check completed successfully');
  } else {
    console.error('\n❌ Database schema check failed');
    process.exit(1);
  }
});
