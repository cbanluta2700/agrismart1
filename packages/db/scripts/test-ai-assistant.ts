/**
 * AI Assistant Database Schema Test Script
 * 
 * This script tests the AI Assistant database schema using direct SQL queries
 * to bypass limitations in the Neon database utilities.
 */

import 'dotenv/config';
import { executeRawQuery } from '../src/neon-db';
import { v4 as uuidv4 } from 'uuid';

async function testAIAssistantSchema() {
  console.log('Testing AI Assistant database schema...\n');

  try {
    // Create a test user if it doesn't already exist
    console.log('==== Setting up test user ====');
    const testUserId = 'test-user-123';
    
    await executeRawQuery`
      INSERT INTO "User" ("id", "name", "email")
      VALUES (${testUserId}, 'Test User', 'test@example.com')
      ON CONFLICT ("id") DO NOTHING
    `;
    
    console.log('Created test user\n');

    // Create a chat session
    console.log('==== Creating a new chat session ====');
    const sessionId = uuidv4();
    
    await executeRawQuery`
      INSERT INTO "AISession" ("id", "userId", "title", "createdAt", "updatedAt")
      VALUES (${sessionId}, ${testUserId}, 'Test AI Conversation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    
    console.log(`Created chat session with ID: ${sessionId}\n`);

    // Add some messages to the session
    console.log('==== Adding chat messages ====');
    
    const userMessageId = uuidv4();
    const userMessageContent = 'What are the best crops to grow in a hot, dry climate?';
    
    await executeRawQuery`
      INSERT INTO "AIMessage" ("id", "sessionId", "role", "content", "createdAt")
      VALUES (${userMessageId}, ${sessionId}, 'user', ${userMessageContent}, CURRENT_TIMESTAMP)
    `;
    console.log(`Added user message with ID: ${userMessageId}`);
    
    const assistantMessageId = uuidv4();
    const assistantMessageContent = 'For hot, dry climates, consider drought-resistant crops like sorghum, millet, chickpeas, and succulents like aloe vera. These crops have adapted to minimize water usage and can withstand extended periods of heat. Additionally, using techniques like mulching, drip irrigation, and shade cloth can help conserve water and protect plants from extreme temperatures.';
    
    await executeRawQuery`
      INSERT INTO "AIMessage" ("id", "sessionId", "role", "content", "promptTokens", "completionTokens", "createdAt")
      VALUES (${assistantMessageId}, ${sessionId}, 'assistant', ${assistantMessageContent}, 150, 200, CURRENT_TIMESTAMP)
    `;
    console.log(`Added assistant message with ID: ${assistantMessageId}\n`);

    // Get all messages for the session
    console.log('==== Getting chat session messages ====');
    const messages = await executeRawQuery`
      SELECT * FROM "AIMessage" WHERE "sessionId" = ${sessionId} ORDER BY "createdAt" ASC
    `;
    
    console.log(`Found ${messages.length} messages for the session`);
    
    if (messages.length > 0) {
      console.log(`Message 1 (${messages[0].role}): ${messages[0].content.substring(0, 50)}...`);
    }
    
    if (messages.length > 1) {
      console.log(`Message 2 (${messages[1].role}): ${messages[1].content.substring(0, 50)}...`);
    }

    // Add feedback for the session
    console.log('\n==== Adding feedback for the session ====');
    const feedbackId = uuidv4();
    
    await executeRawQuery`
      INSERT INTO "AIFeedback" ("id", "sessionId", "userId", "rating", "comment", "createdAt")
      VALUES (${feedbackId}, ${sessionId}, ${testUserId}, 5, 'The AI provided excellent advice for my farming situation!', CURRENT_TIMESTAMP)
    `;
    console.log(`Added feedback with ID: ${feedbackId}\n`);

    console.log('✅ All AI Assistant database schema tests completed successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error during AI Assistant schema testing:', error);
    return false;
  }
}

// Run the test
testAIAssistantSchema()
  .then(() => {
    console.log('Test script completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
