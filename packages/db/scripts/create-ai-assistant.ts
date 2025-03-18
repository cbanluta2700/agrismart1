/**
 * AI Assistant Database Schema Creation
 * 
 * This script creates the necessary database tables for the AI Assistant feature
 * using the Neon PostgreSQL serverless driver directly.
 */

import 'dotenv/config';
import { executeRawQuery } from '../src/neon-db';

async function createAIAssistantSchema() {
  console.log('Creating AI Assistant database schema...');
  
  try {
    // Create AISession table
    console.log('Creating AISession table...');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "AISession" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "title" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "AISession_userId_idx" ON "AISession"("userId")
    `;
    
    // Create AIMessage table
    console.log('Creating AIMessage table...');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "AIMessage" (
        "id" TEXT PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "promptTokens" INTEGER,
        "completionTokens" INTEGER,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("sessionId") REFERENCES "AISession"("id") ON DELETE CASCADE
      )
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "AIMessage_sessionId_idx" ON "AIMessage"("sessionId")
    `;
    
    // Create AIFeedback table
    console.log('Creating AIFeedback table...');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "AIFeedback" (
        "id" TEXT PRIMARY KEY,
        "sessionId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("sessionId") REFERENCES "AISession"("id") ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "AIFeedback_sessionId_idx" ON "AIFeedback"("sessionId")
    `;
    
    await executeRawQuery`
      CREATE INDEX IF NOT EXISTS "AIFeedback_userId_idx" ON "AIFeedback"("userId")
    `;
    
    // Create AIPromptTemplate table
    console.log('Creating AIPromptTemplate table...');
    await executeRawQuery`
      CREATE TABLE IF NOT EXISTS "AIPromptTemplate" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "template" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Insert some initial agriculture-specific prompt templates
    console.log('Adding initial prompt templates...');
    await executeRawQuery`
      INSERT INTO "AIPromptTemplate" ("id", "name", "description", "template", "category", "isActive")
      VALUES 
        (gen_random_uuid(), 'Product Recommendation', 'Recommends agricultural products based on user needs', 'As an agricultural AI assistant, recommend products for: {{query}}. Consider factors like climate, soil type, and farming scale.', 'product_recommendation', TRUE),
        (gen_random_uuid(), 'Farming Advice', 'Provides expert farming advice for crops and livestock', 'Provide detailed farming advice for: {{query}}. Include best practices, common issues, and sustainable solutions.', 'farming_advice', TRUE),
        (gen_random_uuid(), 'Equipment Selection', 'Helps select appropriate farming equipment', 'Recommend appropriate farming equipment for: {{query}}. Consider operation scale, terrain, and specific requirements.', 'equipment_selection', TRUE),
        (gen_random_uuid(), 'Disease Identification', 'Helps identify plant or animal diseases', 'Help identify this potential disease based on the following symptoms: {{query}}. Suggest possible causes and treatments.', 'disease_identification', TRUE)
      ON CONFLICT DO NOTHING
    `;
    
    console.log('✅ AI Assistant database schema created successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to create AI Assistant database schema:', error);
    return false;
  }
}

// Run the schema creation
createAIAssistantSchema()
  .then(() => {
    console.log('Schema creation script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
