/**
 * Chat System Database Models
 * 
 * This module defines the SQL schema and TypeScript interfaces
 * for the chat system, including conversations, messages, and chat-related entities.
 */

import { sql } from '@vercel/postgres';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { 
  pgTable, 
  text, 
  timestamp, 
  boolean, 
  integer,
  json,
  uuid,
  primaryKey
} from 'drizzle-orm/pg-core';

// Create neon client
const client = neon(process.env.DATABASE_URL || '');
export const db = drizzle(client as unknown as NeonQueryFunction<boolean, boolean>);

// Message Status Enum
export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  ERROR = 'ERROR'
}

// Chat System Schemas
// Using pgTable to define PostgreSQL tables

/**
 * Conversation Schema
 * 
 * Stores information about chat conversations between users
 */
export const conversations = pgTable('chat_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  buyerId: text('buyer_id').notNull(), // References user table
  sellerId: text('seller_id').notNull(), // References user table 
  productId: text('product_id'), // References product table
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isGroup: boolean('is_group').default(false),
  groupIconUrl: text('group_icon_url'),
  description: text('description'),
  isPinned: boolean('is_pinned').default(false),
  isArchived: boolean('is_archived').default(false),
  creatorId: text('creator_id'), // For group chats, who created the conversation
  groupAvatar: text('group_avatar'), // URL to avatar for group chats
});

/**
 * Message Schema
 * 
 * Stores chat messages sent between users
 */
export const messages = pgTable('chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  senderId: text('sender_id').notNull(), // References user table
  content: text('content').notNull(),
  attachments: json('attachments'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  replyToId: uuid('reply_to_id').references((): any => messages.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: text('status').default('SENT'),
  isReplyToId: uuid('is_reply_to_id').references((): any => messages.id),
  replyCount: integer('reply_count').default(0),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at'),
});

/**
 * Conversation Participants Schema
 * 
 * Stores which users are part of which conversations
 */
export const conversationParticipants = pgTable('chat_conversation_participants', {
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  userId: text('user_id').notNull(), // References user table
  role: text('role').default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  leftAt: timestamp('left_at'),
  hasNewMessages: boolean('has_new_messages').default(true),
  lastReadMessageId: uuid('last_read_message_id').references(() => messages.id),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  isAdmin: boolean('is_admin').default(false),
  isOwner: boolean('is_owner').default(false),
}, (table) => {
  return {
    pk: primaryKey(table.conversationId, table.userId)
  };
});

/**
 * Message Read Status Schema
 * 
 * Tracks which messages have been read by which users
 */
export const messageReadStatuses = pgTable('chat_message_read_statuses', {
  messageId: uuid('message_id').notNull().references(() => messages.id),
  userId: text('user_id').notNull(), // References user table
  readAt: timestamp('read_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey(table.messageId, table.userId)
  };
});

/**
 * Message Reactions Schema
 * 
 * Stores emoji reactions to messages
 */
export const messageReactions = pgTable('chat_message_reactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id').notNull().references(() => messages.id),
  userId: text('user_id').notNull(), // References user table
  emoji: text('emoji').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Message Attachments Schema
 * 
 * Stores files attached to messages
 */
export const messageAttachments = pgTable('chat_message_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id').notNull().references(() => messages.id),
  url: text('url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  fileType: text('file_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  thumbnailUrl: text('thumbnail_url'),
  processingStatus: text('processing_status'),
  width: integer('width'),
  height: integer('height'),
  mimeType: text('mime_type'),
});

/**
 * Chat Notifications Schema
 * 
 * Stores notifications related to chat activities
 */
export const chatNotifications = pgTable('chat_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(), // References user table
  type: text('type').notNull(), // e.g., 'new_message', 'reaction', 'mention'
  content: text('content').notNull(),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  messageId: uuid('message_id').references(() => messages.id),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript Interfaces matching the schemas
export interface Conversation {
  id: string;
  name?: string;
  buyerId: string;
  sellerId: string;
  productId?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isGroup: boolean;
  groupIconUrl?: string;
  description?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  creatorId?: string;
  groupAvatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: any;
  isRead: boolean;
  readAt?: Date;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
  status?: MessageStatus;
  isReplyToId?: string;
  replyCount?: number;
  isEdited?: boolean;
  editedAt?: Date;
}

export interface ConversationParticipant {
  conversationId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  leftAt?: Date;
  hasNewMessages?: boolean;
  lastReadMessageId?: string;
  notificationsEnabled?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
}

export interface MessageReadStatus {
  messageId: string;
  userId: string;
  readAt: Date;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: Date;
  thumbnailUrl?: string;
  processingStatus?: string;
  width?: number;
  height?: number;
  mimeType?: string;
}

export interface ChatNotification {
  id: string;
  userId: string;
  type: string;
  content: string;
  conversationId?: string;
  messageId?: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Function to create the chat system tables if they don't exist
 */
export async function createChatSystemTables(): Promise<void> {
  try {
    // Create all tables in sequence
    await sql`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        buyer_id TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        product_id TEXT,
        last_message_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_group BOOLEAN DEFAULT FALSE,
        group_icon_url TEXT,
        description TEXT,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_archived BOOLEAN DEFAULT FALSE,
        creator_id TEXT,
        group_avatar TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL,
        content TEXT NOT NULL,
        attachments JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        reply_to_id UUID REFERENCES chat_messages(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        status TEXT DEFAULT 'SENT',
        is_reply_to_id UUID REFERENCES chat_messages(id),
        reply_count INTEGER DEFAULT 0,
        is_edited BOOLEAN DEFAULT FALSE,
        edited_at TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_conversation_participants (
        conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        left_at TIMESTAMP,
        has_new_messages BOOLEAN DEFAULT TRUE,
        last_read_message_id UUID REFERENCES chat_messages(id),
        notifications_enabled BOOLEAN DEFAULT TRUE,
        is_admin BOOLEAN DEFAULT FALSE,
        is_owner BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (conversation_id, user_id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_message_read_statuses (
        message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        read_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (message_id, user_id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_message_reactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        emoji TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_message_attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        thumbnail_url TEXT,
        processing_status TEXT,
        width INTEGER,
        height INTEGER,
        mime_type TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
        message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    console.log('Chat system tables created or already exist');
  } catch (error) {
    console.error('Error creating chat system tables:', error);
    throw error;
  }
}
