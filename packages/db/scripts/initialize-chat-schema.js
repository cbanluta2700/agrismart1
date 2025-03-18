// Initialize Chat Schema with Thread Replies Support
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

async function initializeChatSchema() {
  console.log('Initializing chat schema with thread reply support...');
  
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
    
    // Create NotificationType enum if it doesn't exist
    console.log('\nCreating NotificationType enum if it doesn\'t exist...');
    try {
      const enumExists = await sql`
        SELECT EXISTS (
          SELECT FROM pg_type 
          WHERE typname = 'NotificationType'
        ) as exists
      `;
      
      if (!enumExists[0].exists) {
        await sql`
          CREATE TYPE "NotificationType" AS ENUM (
            'MESSAGE',
            'THREAD_REPLY',
            'MENTION',
            'REACTION'
          )
        `;
        console.log('NotificationType enum created successfully.');
      } else {
        console.log('NotificationType enum already exists. Checking if THREAD_REPLY value exists...');
        
        const threadReplyExists = await sql`
          SELECT EXISTS (
            SELECT FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'NotificationType'
            AND e.enumlabel = 'THREAD_REPLY'
          ) as exists
        `;
        
        if (!threadReplyExists[0].exists) {
          await sql`
            ALTER TYPE "NotificationType" ADD VALUE 'THREAD_REPLY'
          `;
          console.log('Added THREAD_REPLY value to NotificationType enum.');
        } else {
          console.log('THREAD_REPLY value already exists in NotificationType enum.');
        }
      }
    } catch (error) {
      console.warn('Error with NotificationType enum:', error.message);
      console.log('This is not critical - continuing with table creation...');
    }
    
    // Step 1: Create Conversation table if it doesn't exist
    console.log('\nCreating Conversation table if it doesn\'t exist...');
    await sql`
      CREATE TABLE IF NOT EXISTS "Conversation" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "description" TEXT,
        "isGroup" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdById" TEXT,
        CONSTRAINT "Conversation_createdById_fkey" FOREIGN KEY ("createdById") 
          REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `;
    
    // Add index on createdById
    await sql`
      CREATE INDEX IF NOT EXISTS "Conversation_createdById_idx" ON "Conversation"("createdById")
    `;
    
    // Step 2: Create ConversationParticipant table if it doesn't exist
    console.log('Creating ConversationParticipant table if it doesn\'t exist...');
    await sql`
      CREATE TABLE IF NOT EXISTS "ConversationParticipant" (
        "id" TEXT PRIMARY KEY,
        "conversationId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "isAdmin" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") 
          REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "ConversationParticipant_conversationId_userId_key" UNIQUE ("conversationId", "userId")
      )
    `;
    
    // Add indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId")
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId")
    `;
    
    // Step 3: Create Message table with thread reply support
    console.log('Creating Message table with thread reply support...');
    await sql`
      CREATE TABLE IF NOT EXISTS "Message" (
        "id" TEXT PRIMARY KEY,
        "conversationId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "contentType" TEXT NOT NULL DEFAULT 'text',
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        -- Thread reply fields
        "isReplyToId" TEXT,
        "replyCount" INTEGER NOT NULL DEFAULT 0,
        -- Add foreign keys
        CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") 
          REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") 
          REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "Message_isReplyToId_fkey" FOREIGN KEY ("isReplyToId") 
          REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `;
    
    // Add indexes for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId")
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "Message_senderId_idx" ON "Message"("senderId")
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "Message_isReplyToId_idx" ON "Message"("isReplyToId")
    `;
    
    // Step 4: Create Notification table with support for thread replies
    console.log('Creating Notification table with thread reply support...');
    await sql`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "sourceId" TEXT,
        "sourceType" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId")
    `;
    
    // Step 5: Create MessageAttachment table
    console.log('Creating MessageAttachment table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "MessageAttachment" (
        "id" TEXT PRIMARY KEY,
        "messageId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") 
          REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId")
    `;
    
    // Step 6: Create MessageReaction table
    console.log('Creating MessageReaction table...');
    await sql`
      CREATE TABLE IF NOT EXISTS "MessageReaction" (
        "id" TEXT PRIMARY KEY,
        "messageId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "emoji" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") 
          REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") 
          REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "MessageReaction_messageId_userId_emoji_key" UNIQUE ("messageId", "userId", "emoji")
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "MessageReaction_messageId_idx" ON "MessageReaction"("messageId")
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "MessageReaction_userId_idx" ON "MessageReaction"("userId")
    `;
    
    console.log('\n✅ Chat schema with thread reply support initialized successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing chat schema:', error);
    return false;
  }
}

// Execute the function
initializeChatSchema().then(success => {
  if (success) {
    console.log('Chat system with thread replies is now ready to use!');
    
    // Update the Prisma schema to match the database
    console.log('\nNext steps:');
    console.log('1. Make sure your Prisma schema matches the database schema');
    console.log('2. Run "bun prisma generate" to update the Prisma client');
    console.log('3. Test the thread reply functionality');
  } else {
    console.error('Failed to initialize chat schema.');
    process.exit(1);
  }
});
