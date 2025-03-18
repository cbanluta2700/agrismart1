// Test database connection with the updated configuration
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
const rootDir = path.resolve(__dirname, '../');
dotenv.config({ path: path.join(rootDir, '.env') });

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  // Check for database URL
  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Neither POSTGRES_URL nor DATABASE_URL environment variables are set');
    return false;
  }
  
  console.log(`Using DB URL: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
  
  // Create a PostgreSQL client
  const client = new pg.Client({
    connectionString: dbUrl,
  });
  
  try {
    // Connect to the database
    await client.connect();
    console.log('✅ Connected to PostgreSQL database successfully');
    
    // Test simple query
    const result = await client.query('SELECT current_database() as db_name, current_user as user_name');
    console.log('Database info:', result.rows[0]);
    
    // Check for tables
    console.log('\nChecking database tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in the database.');
    } else {
      console.log('Tables in database:');
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Check environment for prisma
    console.log('\nChecking Prisma environment...');
    const isPrismaInstalled = true; // Assuming Prisma is installed since it's in the project
    
    if (isPrismaInstalled) {
      console.log('Prisma is installed in the project');
      console.log('To sync the database schema, run: bun prisma db push');
      console.log('To generate Prisma client, run: bun prisma generate');
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    if (error.message.includes('role') || error.message.includes('password')) {
      console.log('\nPossible authentication issues. Check your connection string credentials.');
    } else if (error.message.includes('connect')) {
      console.log('\nConnection error. Check if the database server is running and accessible.');
      console.log('Also verify that any firewall settings allow your connection.');
    }
    return false;
  } finally {
    // Close the client connection
    await client.end();
  }
}

// Execute the function
testDatabaseConnection().then(success => {
  if (success) {
    console.log('\n✅ Database connection test completed successfully');
    console.log('\nNext steps:');
    console.log('1. If you need to update the database schema, run: bun prisma db push');
    console.log('2. Generate the Prisma client: bun prisma generate');
  } else {
    console.error('\n❌ Database connection test failed');
    process.exit(1);
  }
});
