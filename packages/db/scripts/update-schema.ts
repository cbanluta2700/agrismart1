/**
 * Script to apply Prisma schema changes to Neon PostgreSQL database
 * Uses the @neondatabase/serverless approach for direct SQL execution
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Configure Neon to use WebSockets for better connection stability
neonConfig.webSocketConstructor = globalThis.WebSocket;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQL function with connection string
const getSQL = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  
  return neon(connectionString);
};

/**
 * Create user profile table if it doesn't exist
 */
async function createUserProfileTable() {
  const sql = getSQL();
  
  console.log('Creating UserProfile table if it doesn\'t exist...');
  
  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserProfile'
      );
    `;
    
    if (!tableExists[0]?.exists) {
      // Create the table
      await sql`
        CREATE TABLE "UserProfile" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" TEXT UNIQUE NOT NULL,
          "bio" TEXT,
          "headline" TEXT,
          "location" TEXT,
          "skills" TEXT[],
          "expertise" TEXT[],
          "experience" TEXT,
          "education" TEXT,
          "socialLinks" JSONB,
          "interests" TEXT[],
          "availability" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "FK_UserProfile_User" FOREIGN KEY ("userId")
            REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE INDEX "IDX_UserProfile_userId" ON "UserProfile"("userId");
      `;
      
      console.log('UserProfile table created successfully!');
    } else {
      console.log('UserProfile table already exists.');
    }
    
    return true;
  } catch (error) {
    console.error('Error creating UserProfile table:', error);
    return false;
  }
}

/**
 * Create user connections table if it doesn't exist
 */
async function createUserConnectionTable() {
  const sql = getSQL();
  
  console.log('Creating UserConnection table if it doesn\'t exist...');
  
  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'UserConnection'
      );
    `;
    
    if (!tableExists[0]?.exists) {
      // Create the table
      await sql`
        CREATE TABLE "UserConnection" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" TEXT NOT NULL,
          "connectedToId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UserConnection_userId_connectedToId_key" UNIQUE ("userId", "connectedToId"),
          CONSTRAINT "FK_UserConnection_User" FOREIGN KEY ("userId")
            REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "FK_UserConnection_ConnectedTo" FOREIGN KEY ("connectedToId")
            REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        CREATE INDEX "IDX_UserConnection_userId" ON "UserConnection"("userId");
        CREATE INDEX "IDX_UserConnection_connectedToId" ON "UserConnection"("connectedToId");
      `;
      
      console.log('UserConnection table created successfully!');
    } else {
      console.log('UserConnection table already exists.');
    }
    
    return true;
  } catch (error) {
    console.error('Error creating UserConnection table:', error);
    return false;
  }
}

/**
 * Update Course-Instructor relationship
 */
async function updateCourseInstructorRelationship() {
  const sql = getSQL();
  
  console.log('Updating Course-Instructor relationship...');
  
  try {
    // Add named relation to Course table
    await sql`
      -- First make sure the constraint doesn't already exist
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'FK_Course_Instructor_Named_Relation' 
                  AND table_name = 'Course') THEN
          -- Drop existing constraint if it exists
          ALTER TABLE "Course" DROP CONSTRAINT "FK_Course_Instructor_Named_Relation";
        END IF;
        
        -- Also check for default constraint
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                  WHERE constraint_name = 'Course_instructorId_fkey' 
                  AND table_name = 'Course') THEN
          -- Drop existing constraint
          ALTER TABLE "Course" DROP CONSTRAINT "Course_instructorId_fkey";
        END IF;
          
        -- Add the named relation constraint
        ALTER TABLE "Course" ADD CONSTRAINT "FK_Course_Instructor_Named_Relation" 
          FOREIGN KEY ("instructorId") REFERENCES "User"("id") 
          ON DELETE CASCADE ON UPDATE CASCADE;
      END $$;
    `;
    
    console.log('Course-Instructor relationship updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating Course-Instructor relationship:', error);
    return false;
  }
}

/**
 * Check database tables
 */
async function checkDatabaseTables() {
  const sql = getSQL();
  
  console.log('\n--- CHECKING DATABASE TABLES ---');
  
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    
    console.log(`Found ${tables.length} tables in the database:`);
    
    // Display all table names
    for (const table of tables) {
      const count = await sql`
        SELECT COUNT(*) as count FROM "${sql(table.table_name)}";
      `;
      
      console.log(`- ${table.table_name}: ${count[0]?.count || 0} records`);
    }
    
    return true;
  } catch (error) {
    console.error('Error checking database tables:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('===== UPDATING SCHEMA WITH NEON SERVERLESS =====');
    
    // Check database connection
    const sql = getSQL();
    console.log('Checking database connection...');
    const connectionTest = await sql`SELECT 1 as connected;`;
    
    if (connectionTest[0]?.connected === 1) {
      console.log('✓ Database connection successful!');
    } else {
      throw new Error('Database connection failed');
    }
    
    // Apply schema updates
    await createUserProfileTable();
    await createUserConnectionTable();
    await updateCourseInstructorRelationship();
    
    // Check database tables after updates
    await checkDatabaseTables();
    
    console.log('\n✓ Schema update completed successfully!');
  } catch (error) {
    console.error('Schema update failed:', error);
  }
}

// Run the main function
main().catch(console.error);
