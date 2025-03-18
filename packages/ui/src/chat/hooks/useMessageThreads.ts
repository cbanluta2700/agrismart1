"use client";

import { useState } from 'react';
import type { ThreadMessageType } from '../ThreadPanel';

/**
 * Hook for managing message thread replies
 * Provides functionality for fetching, creating and marking thread replies as read
 */
export function useMessageThreads() {
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Fetch thread replies
  const getThreadReplies = async (messageId: string): Promise<ThreadMessageType[]> => {
    setIsLoadingReplies(true);
    try {
      // Make a direct fetch request instead of using trpc
      const response = await fetch(`/api/chat/threads/${messageId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch thread replies');
      }
      
      const replies = await response.json();
      return replies.map((message: any) => ({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        isRead: message.isRead,
        createdAt: new Date(message.createdAt).toISOString(),
        isReplyToId: message.isReplyToId || undefined,
        replyCount: message.replyCount || 0,
        attachments: message.attachments?.map((att: {
          name: string;
          type: string;
          size: number;
          url: string;
        }) => ({
          name: att.name,
          type: att.type,
          size: att.size,
          url: att.url,
        })),
        reactions: message.reactions?.map((reaction: {
          userId: string;
          emoji: string;
          createdAt: string | Date;
        }) => ({
          userId: reaction.userId,
          emoji: reaction.emoji,
          createdAt: typeof reaction.createdAt === 'string' 
            ? reaction.createdAt 
            : new Date(reaction.createdAt).toISOString(),
        })),
      }));
    } catch (error) {
      console.error('Error fetching thread replies:', error);
      return [];
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Send a thread reply
  const sendThreadReply = async (
    parentMessageId: string, 
    content: string,
    attachments?: Array<{
      name: string;
      type: string;
      size: number;
      url: string;
    }>
  ): Promise<ThreadMessageType | null> => {
    try {
      const response = await fetch('/api/chat/threads/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentMessageId,
          content,
          attachments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send thread reply');
      }

      return response.json();
    } catch (error) {
      console.error('Error sending thread reply:', error);
      return null;
    }
  };

  // Mark thread replies as read
  const markRepliesAsRead = async (messageId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/chat/threads/${messageId}/read`, {
        method: 'PUT',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error marking thread replies as read:', error);
      return false;
    }
  };

  return {
    isLoadingReplies,
    getThreadReplies,
    sendThreadReply,
    markRepliesAsRead,
  };
}
