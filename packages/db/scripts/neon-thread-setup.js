// Direct Neon serverless driver approach for database updates
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');

// Load environment variables
dotenv.config({ path: path.join(rootDir, '.env') });

async function setupThreadReplies() {
  console.log('Setting up thread replies using Neon serverless driver...');
  
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    return false;
  }
  
  console.log(`Using DATABASE_URL: ${dbUrl.replace(/:[^:]*@/, ':****@')}`);
  
  try {
    // Create SQL executor with Neon serverless driver
    const sql = neon(dbUrl);
    
    // Check connection
    const result = await sql`SELECT 1 as test`;
    console.log('Database connection successful:', result);
    
    // Check if Message table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Message'
      ) as exists
    `;
    
    if (!tableCheck[0].exists) {
      console.error('Message table does not exist. Database may not be properly initialized.');
      console.log('Please run "bun prisma db push" to create the base schema first.');
      return false;
    }
    
    console.log('Message table exists. Checking for thread reply columns...');
    
    // Check for isReplyToId column
    const replyToIdCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Message' 
        AND column_name = 'isReplyToId'
      ) as exists
    `;
    
    if (!replyToIdCheck[0].exists) {
      console.log('Adding isReplyToId column to Message table...');
      await sql`
        ALTER TABLE "Message" 
        ADD COLUMN "isReplyToId" TEXT REFERENCES "Message"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE
      `;
      
      await sql`
        CREATE INDEX "Message_isReplyToId_idx" ON "Message"("isReplyToId")
      `;
    } else {
      console.log('isReplyToId column already exists.');
    }
    
    // Check for replyCount column
    const replyCountCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Message' 
        AND column_name = 'replyCount'
      ) as exists
    `;
    
    if (!replyCountCheck[0].exists) {
      console.log('Adding replyCount column to Message table...');
      await sql`
        ALTER TABLE "Message" 
        ADD COLUMN "replyCount" INTEGER NOT NULL DEFAULT 0
      `;
    } else {
      console.log('replyCount column already exists.');
    }
    
    // Check if NotificationType enum exists and has THREAD_REPLY value
    try {
      const enumTypeCheck = await sql`
        SELECT EXISTS (
          SELECT FROM pg_type 
          WHERE typname = 'NotificationType'
        ) as exists
      `;
      
      if (enumTypeCheck[0].exists) {
        // Check if THREAD_REPLY value exists in the enum
        const enumValueCheck = await sql`
          SELECT EXISTS (
            SELECT FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'NotificationType'
            AND e.enumlabel = 'THREAD_REPLY'
          ) as exists
        `;
        
        if (!enumValueCheck[0].exists) {
          console.log('Adding THREAD_REPLY to NotificationType enum...');
          await sql`
            ALTER TYPE "NotificationType" ADD VALUE 'THREAD_REPLY'
          `;
        } else {
          console.log('THREAD_REPLY value already exists in NotificationType enum.');
        }
      } else {
        console.log('NotificationType enum does not exist. Skipping enum update.');
      }
    } catch (err) {
      console.log('Error checking or updating NotificationType enum:', err.message);
      console.log('This is not critical - enum might be handled by Prisma migrations.');
    }
    
    console.log('✅ Thread replies setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error setting up thread replies:', error);
    return false;
  }
}

// Run the function
setupThreadReplies().then(success => {
  if (success) {
    console.log('Thread reply functionality is now available in the database!');
  } else {
    console.error('Failed to set up thread reply functionality.');
    process.exit(1);
  }
});
