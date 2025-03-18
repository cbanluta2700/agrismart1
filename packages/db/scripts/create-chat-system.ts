/**
 * Chat System Database Schema Creation
 * 
 * This script creates the necessary database tables for the Socket.io chat system
 * using the Neon PostgreSQL serverless driver directly.
 */

import 'dotenv/config';
import { executeRawQuery } from '../src/neon-db';

async function createChatSystemSchema() {
  console.log('Creating Chat System database schema...');
  
  try {
    // Create ChatConversation table
    console.log('Creating ChatConversation table...');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "ChatConversation" (
        "id" TEXT PRIMARY KEY,
        "productId" TEXT,
        "sellerId" TEXT NOT NULL,
        "buyerId" TEXT NOT NULL,
        "title" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "lastMessage" TEXT,
        "lastMessageAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL
      )
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "ChatConversation_sellerId_idx" ON "ChatConversation"("sellerId")
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "ChatConversation_buyerId_idx" ON "ChatConversation"("buyerId")
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "ChatConversation_productId_idx" ON "ChatConversation"("productId")
    `;
    
    // Create ChatMessage table
    console.log('Creating ChatMessage table...');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "ChatMessage" (
        "id" TEXT PRIMARY KEY,
        "conversationId" TEXT NOT NULL,
        "senderId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
        "readAt" TIMESTAMP,
        "attachments" JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE,
        FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId")
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "ChatMessage_senderId_idx" ON "ChatMessage"("senderId")
    `;
    
    // Create ChatParticipant table (for potential group chats in the future)
    console.log('Creating ChatParticipant table...');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "ChatParticipant" (
        "id" TEXT PRIMARY KEY,
        "conversationId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "leftAt" TIMESTAMP,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "lastRead" TIMESTAMP,
        FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        UNIQUE ("conversationId", "userId")
      )
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "ChatParticipant_conversationId_idx" ON "ChatParticipant"("conversationId")
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "ChatParticipant_userId_idx" ON "ChatParticipant"("userId")
    `;
    
    console.log('✅ Chat System database schema created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create Chat System database schema:', error);
    return false;
  }
}

// Run the schema creation
createChatSystemSchema()
  .then(() => {
    console.log('Schema creation script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
