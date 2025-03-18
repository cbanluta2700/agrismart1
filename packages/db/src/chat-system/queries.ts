/**
 * Chat System Database Queries
 * 
 * This module provides functions for interacting with the chat system database,
 * following the same patterns established in the Saasfly boilerplate.
 */

import { sql } from '@vercel/postgres';
import { db } from './models';
import { 
  conversations, 
  messages, 
  conversationParticipants,
  messageReadStatuses,
  messageReactions,
  messageAttachments,
  chatNotifications,
  Conversation,
  Message,
  ConversationParticipant,
  MessageReadStatus,
  MessageReaction,
  MessageAttachment,
  ChatNotification,
  MessageStatus
} from './models';
import { eq, and, or, desc, asc, isNull, sql as drizzleSql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

/**
 * Get all conversations for a user
 */
export async function getUserChatConversations(userId: string): Promise<Conversation[]> {
  try {
    const result = await sql`
      SELECT c.*
      FROM chat_conversations c
      WHERE c.buyer_id = ${userId} OR c.seller_id = ${userId}
      OR c.id IN (
        SELECT cp.conversation_id
        FROM chat_conversation_participants cp
        WHERE cp.user_id = ${userId} AND cp.left_at IS NULL
      )
      ORDER BY c.last_message_at DESC
    `;
    
    return result.rows as Conversation[];
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    throw error;
  }
}

/**
 * Get a conversation by its ID
 */
export async function getChatConversationById(conversationId: string): Promise<Conversation | null> {
  try {
    const result = await sql`
      SELECT *
      FROM chat_conversations
      WHERE id = ${conversationId}
    `;
    
    return result.rows.length > 0 ? (result.rows[0] as Conversation) : null;
  } catch (error) {
    console.error('Error fetching conversation by ID:', error);
    throw error;
  }
}

/**
 * Get all messages in a conversation
 */
export async function getChatConversationMessages(
  conversationId: string,
  limit = 50,
  before?: Date
): Promise<Message[]> {
  try {
    const whereClause = before 
      ? `WHERE conversation_id = $1 AND created_at < $2`
      : `WHERE conversation_id = $1`;
    
    const params = before 
      ? [conversationId, before] 
      : [conversationId];
    
    const query = `
      SELECT *
      FROM chat_messages
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
    `;
    
    const result = await sql.query(query, [...params, limit]);
    
    return result.rows as Message[];
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
}

/**
 * Get or create a conversation between a buyer and seller
 */
export async function getOrCreateChatConversation(
  buyerId: string,
  sellerId: string,
  productId?: string
): Promise<Conversation> {
  try {
    // Check if conversation already exists
    const existingConvo = await sql`
      SELECT *
      FROM chat_conversations
      WHERE 
        (buyer_id = ${buyerId} AND seller_id = ${sellerId})
        OR (buyer_id = ${sellerId} AND seller_id = ${buyerId})
        ${productId ? sql`AND product_id = ${productId}` : sql``}
      LIMIT 1
    `;
    
    if (existingConvo.rows.length > 0) {
      return existingConvo.rows[0] as Conversation;
    }
    
    // Create new conversation
    const newConvo = await sql`
      INSERT INTO chat_conversations (
        buyer_id, seller_id, product_id, is_group, name
      )
      VALUES (
        ${buyerId}, ${sellerId}, ${productId || null}, FALSE, ${null}
      )
      RETURNING *
    `;
    
    return newConvo.rows[0] as Conversation;
  } catch (error) {
    console.error('Error in getOrCreateChatConversation:', error);
    throw error;
  }
}

/**
 * Create a group conversation
 */
export async function createGroupConversation(
  name: string,
  creatorId: string,
  memberIds: string[],
  description?: string,
  groupAvatar?: string
): Promise<Conversation> {
  try {
    // Create the conversation
    const conversationResult = await sql`
      INSERT INTO chat_conversations (
        name, creator_id, is_group, description, group_avatar
      )
      VALUES (
        ${name}, ${creatorId}, TRUE, ${description || null}, ${groupAvatar || null}
      )
      RETURNING *
    `;
    
    const conversation = conversationResult.rows[0] as Conversation;
    
    // Add all members as participants
    const uniqueMembers = new Set([creatorId, ...memberIds]);
    
    // Convert Set to Array before iterating for compatibility with older JavaScript versions
    const uniqueMembersArray = Array.from(uniqueMembers);
    
    for (const memberId of uniqueMembersArray) {
      await sql`
        INSERT INTO chat_conversation_participants (
          conversation_id, user_id, role, is_admin, is_owner
        )
        VALUES (
          ${conversation.id}, 
          ${memberId}, 
          ${'member'}, 
          ${memberId === creatorId}, 
          ${memberId === creatorId}
        )
      `;
    }
    
    return conversation;
  } catch (error) {
    console.error('Error creating group conversation:', error);
    throw error;
  }
}

/**
 * Add a chat message
 */
export async function addChatMessage(
  conversationId: string,
  senderId: string,
  content: string,
  attachments?: any,
  replyToId?: string,
  status: MessageStatus = MessageStatus.SENT
): Promise<Message> {
  try {
    // Verify conversation exists and user is a participant
    const convoCheck = await sql`
      SELECT * FROM chat_conversations 
      WHERE id = ${conversationId}
    `;
    
    if (convoCheck.rows.length === 0) {
      throw new Error('Conversation not found');
    }
    
    const convo = convoCheck.rows[0] as Conversation;
    
    // Check if user is participant in conversation
    const isParticipant = 
      convo.buyerId === senderId || 
      convo.sellerId === senderId ||
      (convo.isGroup && (await sql`
        SELECT * FROM chat_conversation_participants
        WHERE conversation_id = ${conversationId}
        AND user_id = ${senderId}
        AND left_at IS NULL
      `).rows.length > 0);
    
    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }
    
    // If this is a reply to another message, increment its reply count
    if (replyToId) {
      await sql`
        UPDATE chat_messages
        SET reply_count = reply_count + 1
        WHERE id = ${replyToId}
      `;
    }
    
    // Add the message
    const messageResult = await sql`
      INSERT INTO chat_messages (
        conversation_id, sender_id, content, attachments, reply_to_id, status
      )
      VALUES (
        ${conversationId}, ${senderId}, ${content}, ${attachments ? JSON.stringify(attachments) : null}, ${replyToId || null}, ${status}
      )
      RETURNING *
    `;
    
    const message = messageResult.rows[0] as Message;
    
    // Update conversation's last_message_at timestamp
    await sql`
      UPDATE chat_conversations
      SET last_message_at = NOW(), updated_at = NOW()
      WHERE id = ${conversationId}
    `;
    
    // Mark as unread for all participants except sender
    await sql`
      UPDATE chat_conversation_participants
      SET has_new_messages = TRUE
      WHERE conversation_id = ${conversationId}
      AND user_id != ${senderId}
    `;
    
    return message;
  } catch (error) {
    console.error('Error adding chat message:', error);
    throw error;
  }
}

/**
 * Mark messages as read for a user
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    // Get unread messages in the conversation
    const unreadMessages = await sql`
      SELECT * FROM chat_messages
      WHERE conversation_id = ${conversationId}
      AND is_read = FALSE
      AND sender_id != ${userId}
    `;
    
    if (unreadMessages.rows.length === 0) {
      return;
    }
    
    // Mark messages as read
    await sql`
      UPDATE chat_messages
      SET is_read = TRUE, 
          read_at = NOW(),
          status = ${MessageStatus.READ}
      WHERE conversation_id = ${conversationId}
      AND is_read = FALSE
      AND sender_id != ${userId}
    `;
    
    // Insert read status records
    for (const msg of unreadMessages.rows) {
      await sql`
        INSERT INTO chat_message_read_statuses (
          message_id, user_id
        )
        VALUES (
          ${msg.id}, ${userId}
        )
        ON CONFLICT (message_id, user_id) DO NOTHING
      `;
    }
    
    // Update participant record
    const lastMessageId = unreadMessages.rows.length > 0 ? unreadMessages.rows[0]?.id : null;
    if (lastMessageId) {
      await sql`
        UPDATE chat_conversation_participants
        SET has_new_messages = FALSE,
            last_read_message_id = ${lastMessageId}
        WHERE conversation_id = ${conversationId}
        AND user_id = ${userId}
      `;
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

/**
 * Get unread message count for a user
 */
export async function getUnreadMessageCount(userId: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM chat_messages m
      JOIN chat_conversations c ON m.conversation_id = c.id
      WHERE m.is_read = FALSE
      AND m.sender_id != ${userId}
      AND (
        c.buyer_id = ${userId} 
        OR c.seller_id = ${userId}
        OR c.id IN (
          SELECT conversation_id 
          FROM chat_conversation_participants
          WHERE user_id = ${userId}
          AND left_at IS NULL
        )
      )
    `;
    
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error getting unread message count:', error);
    throw error;
  }
}

/**
 * Add or remove a reaction to a message
 */
export async function toggleMessageReaction(
  messageId: string,
  userId: string,
  emoji: string
): Promise<{ added: boolean }> {
  try {
    // Check if reaction already exists
    const existing = await sql`
      SELECT * FROM chat_message_reactions
      WHERE message_id = ${messageId}
      AND user_id = ${userId}
      AND emoji = ${emoji}
    `;
    
    if (existing.rows.length > 0) {
      // Remove reaction
      await sql`
        DELETE FROM chat_message_reactions
        WHERE message_id = ${messageId}
        AND user_id = ${userId}
        AND emoji = ${emoji}
      `;
      
      return { added: false };
    } else {
      // Add reaction
      await sql`
        INSERT INTO chat_message_reactions (
          message_id, user_id, emoji
        )
        VALUES (
          ${messageId}, ${userId}, ${emoji}
        )
      `;
      
      return { added: true };
    }
  } catch (error) {
    console.error('Error toggling message reaction:', error);
    throw error;
  }
}

/**
 * Get all reactions for a message
 */
export async function getMessageReactions(messageId: string): Promise<MessageReaction[]> {
  try {
    const result = await sql`
      SELECT * FROM chat_message_reactions
      WHERE message_id = ${messageId}
      ORDER BY created_at ASC
    `;
    
    return result.rows as MessageReaction[];
  } catch (error) {
    console.error('Error getting message reactions:', error);
    throw error;
  }
}

/**
 * Get thread replies (messages that reply to a specific message)
 */
export async function getThreadReplies(parentMessageId: string): Promise<Message[]> {
  try {
    const result = await sql`
      SELECT * FROM chat_messages
      WHERE reply_to_id = ${parentMessageId}
      ORDER BY created_at ASC
    `;
    
    return result.rows as Message[];
  } catch (error) {
    console.error('Error getting thread replies:', error);
    throw error;
  }
}

/**
 * Add a message attachment
 */
export async function addMessageAttachment(
  messageId: string,
  url: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  thumbnailUrl?: string,
  mimeType?: string
): Promise<MessageAttachment> {
  try {
    const result = await sql`
      INSERT INTO chat_message_attachments (
        message_id, url, file_name, file_size, file_type, thumbnail_url, mime_type
      )
      VALUES (
        ${messageId}, ${url}, ${fileName}, ${fileSize}, ${fileType}, 
        ${thumbnailUrl || null}, ${mimeType || null}
      )
      RETURNING *
    `;
    
    return result.rows[0] as MessageAttachment;
  } catch (error) {
    console.error('Error adding message attachment:', error);
    throw error;
  }
}

/**
 * Get all attachments for a message
 */
export async function getMessageAttachments(messageId: string): Promise<MessageAttachment[]> {
  try {
    const result = await sql`
      SELECT * FROM chat_message_attachments
      WHERE message_id = ${messageId}
      ORDER BY created_at ASC
    `;
    
    return result.rows as MessageAttachment[];
  } catch (error) {
    console.error('Error getting message attachments:', error);
    throw error;
  }
}

/**
 * Update message status
 */
export async function updateMessageStatus(
  messageId: string,
  status: MessageStatus
): Promise<Message> {
  try {
    const result = await sql`
      UPDATE chat_messages
      SET status = ${status},
          updated_at = NOW()
      WHERE id = ${messageId}
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      throw new Error('Message not found');
    }
    
    return result.rows[0] as Message;
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
}

/**
 * Add a chat notification
 */
export async function addChatNotification(
  userId: string,
  type: string,
  content: string,
  conversationId?: string,
  messageId?: string
): Promise<ChatNotification> {
  try {
    const result = await sql`
      INSERT INTO chat_notifications (
        user_id, type, content, conversation_id, message_id
      )
      VALUES (
        ${userId}, ${type}, ${content}, ${conversationId || null}, ${messageId || null}
      )
      RETURNING *
    `;
    
    return result.rows[0] as ChatNotification;
  } catch (error) {
    console.error('Error adding chat notification:', error);
    throw error;
  }
}

/**
 * Get user's chat notifications
 */
export async function getUserChatNotifications(
  userId: string,
  limit = 20,
  offset = 0
): Promise<ChatNotification[]> {
  try {
    const result = await sql`
      SELECT * FROM chat_notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    return result.rows as ChatNotification[];
  } catch (error) {
    console.error('Error getting user chat notifications:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markChatNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await sql`
      UPDATE chat_notifications
      SET is_read = true
      WHERE id = ${notificationId}
    `;
  } catch (error) {
    console.error('Error marking chat notification as read:', error);
    throw error;
  }
}

/**
 * Count unread notifications for a user
 */
export async function getUnreadChatNotificationCount(userId: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count
      FROM chat_notifications
      WHERE user_id = ${userId}
      AND is_read = false
    `;
    
    if (!result.rows || result.rows.length === 0 || !result.rows[0]) {
      return 0;
    }
    
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error getting unread chat notification count:', error);
    throw error;
  }
}

/**
 * Add member to a group conversation
 */
export async function addGroupConversationMember(
  conversationId: string,
  userId: string,
  addedBy: string,
  role = 'MEMBER'
): Promise<ConversationParticipant> {
  try {
    // Check if this is a group conversation
    const conversation = await getChatConversationById(conversationId);
    
    if (!conversation || !conversation.isGroup) {
      throw new Error('Not a group conversation');
    }
    
    // Check if the adder is an admin
    const adminCheck = await sql`
      SELECT * FROM chat_conversation_participants
      WHERE conversation_id = ${conversationId}
      AND user_id = ${addedBy}
      AND role = 'ADMIN'
      AND left_at IS NULL
    `;
    
    if (adminCheck.rows.length === 0) {
      throw new Error('Only admins can add members');
    }
    
    // Check if user is already a member
    const participantCheck = await sql`
      SELECT * FROM chat_conversation_participants
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
    `;
    
    if (participantCheck.rows.length > 0) {
      // If user previously left, update their record
      if (participantCheck.rows[0] && participantCheck.rows[0].left_at) {
        await sql`
          UPDATE chat_conversation_participants
          SET left_at = NULL, role = ${role}, joined_at = NOW()
          WHERE conversation_id = ${conversationId}
          AND user_id = ${userId}
        `;
      } else {
        throw new Error('User is already a member of this group');
      }
    } else {
      // Add new member
      await sql`
        INSERT INTO chat_conversation_participants (
          conversation_id, user_id, role
        ) VALUES (
          ${conversationId}, ${userId}, ${role}
        )
      `;
    }
    
    const participant = await sql`
      SELECT * FROM chat_conversation_participants
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
    `;
    
    if (participant.rows.length === 0) {
      throw new Error('Failed to add participant');
    }
    
    return participant.rows[0] as ConversationParticipant;
  } catch (error) {
    console.error('Error adding group conversation member:', error);
    throw error;
  }
}

/**
 * Remove member from a group conversation
 */
export async function removeGroupConversationMember(
  conversationId: string,
  userId: string,
  removedBy: string
): Promise<void> {
  try {
    // Check if this is a group conversation
    const conversation = await getChatConversationById(conversationId);
    
    if (!conversation || !conversation.isGroup) {
      throw new Error('Not a group conversation');
    }
    
    // Check if the remover is an admin or the user themselves
    if (userId !== removedBy) {
      const adminCheck = await sql`
        SELECT * FROM chat_conversation_participants
        WHERE conversation_id = ${conversationId}
        AND user_id = ${removedBy}
        AND role = 'ADMIN'
        AND left_at IS NULL
      `;
      
      if (adminCheck.rows.length === 0) {
        throw new Error('Only admins can remove members');
      }
    }
    
    // Mark user as left
    await sql`
      UPDATE chat_conversation_participants
      SET left_at = NOW()
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
      AND left_at IS NULL
    `;
  } catch (error) {
    console.error('Error removing group conversation member:', error);
    throw error;
  }
}

/**
 * Search for messages containing a query
 */
export async function searchChatMessages(
  userId: string,
  query: string,
  limit = 20
): Promise<Message[]> {
  try {
    const result = await sql`
      SELECT m.*
      FROM chat_messages m
      JOIN chat_conversations c ON m.conversation_id = c.id
      WHERE (c.buyer_id = ${userId} OR c.seller_id = ${userId}
        OR c.id IN (
          SELECT cp.conversation_id
          FROM chat_conversation_participants cp
          WHERE cp.user_id = ${userId} AND cp.left_at IS NULL
        ))
      AND m.content ILIKE ${`%${query}%`}
      ORDER BY m.created_at DESC
      LIMIT ${limit}
    `;
    
    return result.rows as Message[];
  } catch (error) {
    console.error('Error searching chat messages:', error);
    throw error;
  }
}

/**
 * Mark conversation as archived
 */
export async function archiveConversation(
  conversationId: string,
  userId: string
): Promise<Conversation> {
  try {
    const result = await sql`
      UPDATE chat_conversations
      SET is_archived = TRUE
      WHERE id = ${conversationId}
      AND (buyer_id = ${userId} OR seller_id = ${userId} OR creator_id = ${userId})
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      throw new Error('Conversation not found or user not authorized');
    }
    
    return result.rows[0] as Conversation;
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
}

/**
 * Mark conversation as pinned or unpinned
 */
export async function toggleConversationPin(
  conversationId: string,
  userId: string
): Promise<Conversation> {
  try {
    // Get current state
    const current = await sql`
      SELECT is_pinned FROM chat_conversations
      WHERE id = ${conversationId}
      AND (buyer_id = ${userId} OR seller_id = ${userId} OR creator_id = ${userId})
    `;
    
    if (current.rows.length === 0) {
      throw new Error('Conversation not found or user not authorized');
    }
    
    const isPinned = current.rows[0]?.is_pinned || false;
    
    // Toggle pin state
    const result = await sql`
      UPDATE chat_conversations
      SET is_pinned = ${!isPinned}
      WHERE id = ${conversationId}
      AND (buyer_id = ${userId} OR seller_id = ${userId} OR creator_id = ${userId})
      RETURNING *
    `;
    
    return result.rows[0] as Conversation;
  } catch (error) {
    console.error('Error toggling conversation pin:', error);
    throw error;
  }
}

/**
 * Edit a message
 */
export async function editMessage(
  messageId: string,
  userId: string,
  newContent: string
): Promise<Message> {
  try {
    const result = await sql`
      UPDATE chat_messages
      SET content = ${newContent},
          is_edited = TRUE,
          edited_at = NOW(),
          updated_at = NOW()
      WHERE id = ${messageId}
      AND sender_id = ${userId}
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      throw new Error('Message not found or user not authorized to edit');
    }
    
    return result.rows[0] as Message;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
}
