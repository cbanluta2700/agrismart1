import { eq, and, desc } from "drizzle-orm";
import { nanoid } from 'nanoid';
import type { Message as UIMessage } from 'ai';
import { db } from "@saasfly/db";
import { chats, messages, votes } from './schema';

/**
 * Create a new chat session
 */
export async function createChat({ 
  title, 
  userId, 
  model, 
  visibility = 'private'
}: { 
  title: string; 
  userId: string; 
  model: string;
  visibility?: 'public' | 'private'; 
}) {
  // Generate a share path if it's public
  const sharePath = visibility === 'public' ? nanoid() : null;
  
  const [chat] = await db.insert(chats).values({
    title,
    userId,
    model,
    visibility,
    sharePath,
  }).returning();

  return chat;
}

/**
 * Save a message to the database
 */
export async function saveMessage({
  chatId,
  content,
  role,
  model,
  reasoning,
  metadata,
}: {
  chatId: string;
  content: string;
  role: string;
  model?: string;
  reasoning?: string;
  metadata?: any;
}) {
  const [message] = await db.insert(messages).values({
    chatId,
    content,
    role,
    model,
    reasoning,
    metadata: metadata ? JSON.stringify(metadata) : null,
  }).returning();

  return message;
}

/**
 * Get all messages for a chat
 */
export async function getChatMessages(chatId: string) {
  return await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: messages.createdAt,
  });
}

/**
 * Convert database messages to UI messages
 */
export function dbToUIMessages(dbMessages: any[]): UIMessage[] {
  return dbMessages.map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    createdAt: msg.createdAt,
    reasoning: msg.reasoning,
  }));
}

/**
 * Get user's chat history
 */
export async function getUserChats(userId: string) {
  return await db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: desc(chats.updatedAt),
  });
}

/**
 * Save user vote/feedback on a message
 */
export async function saveVote({
  userId,
  messageId,
  chatId,
  status,
}: {
  userId: string;
  messageId: string;
  chatId: string;
  status: number; // 1 for upvote, -1 for downvote
}) {
  // Check if vote already exists
  const existingVote = await db.query.votes.findFirst({
    where: and(
      eq(votes.userId, userId),
      eq(votes.messageId, messageId)
    ),
  });

  if (existingVote) {
    // Update existing vote
    const [vote] = await db
      .update(votes)
      .set({ status })
      .where(
        and(eq(votes.userId, userId), eq(votes.messageId, messageId))
      )
      .returning();
    return vote;
  } else {
    // Create new vote
    const [vote] = await db
      .insert(votes)
      .values({
        userId,
        messageId,
        chatId,
        status,
      })
      .returning();
    return vote;
  }
}
