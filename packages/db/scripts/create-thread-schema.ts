/**
 * Thread Reply Database Schema Creation
 * 
 * This script creates the necessary database structures for the thread reply feature
 * using the Neon PostgreSQL serverless driver directly.
 */

import 'dotenv/config';
import { executeRawQuery } from '../src/neon-db';

async function createThreadReplySchema() {
  console.log('Creating Thread Reply database schema...');
  
  try {
    // First check if Message table exists
    console.log('Checking if Message table exists...');
    const tableCheck = await executeRawQuery`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Message'
      ) as exists
    `;
    
    if (!tableCheck[0]?.exists) {
      console.log('Message table does not exist. Creating it first...');
      
      // Create the Message table if it doesn't exist
      await executeRawQuery`
        CREATE TABLE IF NOT EXISTS "Message" (
          "id" TEXT PRIMARY KEY,
          "conversationId" TEXT NOT NULL,
          "senderId" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "isRead" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          -- Thread reply fields
          "isReplyToId" TEXT,
          "replyCount" INTEGER NOT NULL DEFAULT 0,
          -- Add foreign keys
          CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") 
            REFERENCES "Conversation"("id") ON DELETE CASCADE,
          CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") 
            REFERENCES "User"("id") ON DELETE CASCADE
        )
      `;
      
      // Add self-reference foreign key for thread replies
      await executeRawQuery`
        ALTER TABLE "Message" 
        ADD CONSTRAINT "Message_isReplyToId_fkey" 
        FOREIGN KEY ("isReplyToId") REFERENCES "Message"("id") 
        ON DELETE SET NULL ON UPDATE CASCADE
      `;
      
      // Create necessary indexes
      await executeRawQuery`
        CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId")
      `;
      
      await executeRawQuery`
        CREATE INDEX "Message_senderId_idx" ON "Message"("senderId")
      `;
      
      await executeRawQuery`
        CREATE INDEX "Message_isReplyToId_idx" ON "Message"("isReplyToId")
      `;
      
      console.log('Message table created successfully with thread reply fields.');
    } else {
      console.log('Message table exists. Checking for thread reply fields...');
      
      // Check if isReplyToId column exists
      const isReplyToIdCheck = await executeRawQuery`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'Message' 
          AND column_name = 'isReplyToId'
        ) as exists
      `;
      
      if (!isReplyToIdCheck[0]?.exists) {
        console.log('Adding isReplyToId column to Message table...');
        
        // Add isReplyToId column
        await executeRawQuery`
          ALTER TABLE "Message" 
          ADD COLUMN "isReplyToId" TEXT
        `;
        
        // Add foreign key constraint
        await executeRawQuery`
          ALTER TABLE "Message" 
          ADD CONSTRAINT "Message_isReplyToId_fkey" 
          FOREIGN KEY ("isReplyToId") REFERENCES "Message"("id") 
          ON DELETE SET NULL ON UPDATE CASCADE
        `;
        
        // Create index for better performance
        await executeRawQuery`
          CREATE INDEX "Message_isReplyToId_idx" ON "Message"("isReplyToId")
        `;
      } else {
        console.log('isReplyToId column already exists.');
      }
      
      // Check if replyCount column exists
      const replyCountCheck = await executeRawQuery`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'Message' 
          AND column_name = 'replyCount'
        ) as exists
      `;
      
      if (!replyCountCheck[0]?.exists) {
        console.log('Adding replyCount column to Message table...');
        
        // Add replyCount column
        await executeRawQuery`
          ALTER TABLE "Message" 
          ADD COLUMN "replyCount" INTEGER NOT NULL DEFAULT 0
        `;
      } else {
        console.log('replyCount column already exists.');
      }
    }
    
    // Check if Conversation table exists
    const conversationCheck = await executeRawQuery`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Conversation'
      ) as exists
    `;
    
    if (!conversationCheck[0]?.exists) {
      console.log('Conversation table does not exist. Creating it...');
      
      // Create the Conversation table
      await executeRawQuery`
        CREATE TABLE IF NOT EXISTS "Conversation" (
          "id" TEXT PRIMARY KEY,
          "name" TEXT,
          "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      console.log('Conversation table created successfully.');
    }
    
    // Update NotificationType enum if it exists
    try {
      const enumTypeCheck = await executeRawQuery`
        SELECT EXISTS (
          SELECT FROM pg_type 
          WHERE typname = 'NotificationType'
        ) as exists
      `;
      
      if (enumTypeCheck[0]?.exists) {
        // Check if THREAD_REPLY value exists in the enum
        const enumValueCheck = await executeRawQuery`
          SELECT EXISTS (
            SELECT FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'NotificationType'
            AND e.enumlabel = 'THREAD_REPLY'
          ) as exists
        `;
        
        if (!enumValueCheck[0]?.exists) {
          console.log('Adding THREAD_REPLY to NotificationType enum...');
          
          // Add THREAD_REPLY to enum
          await executeRawQuery`
            ALTER TYPE "NotificationType" ADD VALUE 'THREAD_REPLY'
          `;
          
          console.log('THREAD_REPLY value added to NotificationType enum.');
        } else {
          console.log('THREAD_REPLY value already exists in NotificationType enum.');
        }
      } else {
        console.log('NotificationType enum does not exist. Creating basic version...');
        
        // Create NotificationType enum if it doesn't exist
        await executeRawQuery`
          CREATE TYPE "NotificationType" AS ENUM (
            'MESSAGE', 
            'THREAD_REPLY', 
            'MENTION'
          )
        `;
        
        console.log('NotificationType enum created with THREAD_REPLY value.');
      }
    } catch (err) {
      console.log('Error updating NotificationType enum:', err);
      console.log('This is not critical - the application can still function without this enum.');
    }
    
    console.log('✅ Thread reply schema setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Error creating thread reply schema:', error);
    return false;
  }
}

// Run the schema creation
createThreadReplySchema()
  .then(success => {
    if (success) {
      console.log('Thread reply functionality is now available in the database!');
      process.exit(0);
    } else {
      console.error('Failed to set up thread reply functionality.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
