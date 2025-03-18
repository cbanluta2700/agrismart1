import { useState, useCallback, useEffect } from 'react';
import { useMessageThreads } from './useMessageThreads';
import { useSocketNotifications } from './useSocketNotifications';
import { ThreadMessageType } from '../ThreadPanel';

interface ChatOptions {
  userId: string;
  onNewMessage?: (message: any) => void;
  onThreadReply?: (message: any) => void;
}

/**
 * Main hook for managing chat functionality including conversations, messages, and thread replies
 */
export function useChat({ userId, onNewMessage, onThreadReply }: ChatOptions) {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [threadParentMessage, setThreadParentMessage] = useState<ThreadMessageType | null>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [threadReplies, setThreadReplies] = useState<ThreadMessageType[]>([]);
  
  // Use our message threads hook for thread-specific operations
  const {
    isLoadingReplies,
    getThreadReplies,
    sendThreadReply,
    markRepliesAsRead,
  } = useMessageThreads();

  // Handle real-time socket notifications
  const {
    connected: socketConnected,
    emitThreadReply,
    emitThreadRead
  } = useSocketNotifications({
    userId,
    onNewMessage,
    onNewThreadReply: (message, parentMessageId) => {
      // If this is a reply to the currently open thread, add it to the thread replies
      if (threadParentMessage && threadParentMessage.id === parentMessageId) {
        setThreadReplies(prev => [...prev, message]);
      }
      
      // Callback for parent component
      if (onThreadReply) {
        onThreadReply(message);
      }
    },
    onThreadRead: (parentMessageId) => {
      // If this is the currently open thread, update read status for all messages
      if (threadParentMessage && threadParentMessage.id === parentMessageId) {
        setThreadReplies(prev => 
          prev.map(reply => ({
            ...reply,
            isRead: true
          }))
        );
      }
    }
  });

  // Open thread panel for a specific message
  const openThreadForMessage = useCallback(async (message: ThreadMessageType) => {
    setThreadParentMessage(message);
    setIsThreadOpen(true);
    
    // Fetch thread replies
    const replies = await getThreadReplies(message.id);
    setThreadReplies(replies);
    
    // Mark thread as read when opened
    if (message.id) {
      await markRepliesAsRead(message.id);
      
      // Notify other users that this thread has been read
      emitThreadRead(message.id);
    }
  }, [markRepliesAsRead, getThreadReplies, emitThreadRead]);

  // Close thread panel
  const closeThread = useCallback(() => {
    setIsThreadOpen(false);
  }, []);

  // Handle sending a reply to a thread
  const handleSendThreadReply = useCallback(async (content: string, attachments?: any[]) => {
    if (!threadParentMessage) return null;
    
    try {
      const newReply = await sendThreadReply(
        threadParentMessage.id,
        content,
        attachments
      );
      
      if (newReply) {
        // Add to local state
        setThreadReplies(prev => [...prev, newReply]);
        
        // Emit socket event for real-time updates
        emitThreadReply(newReply, threadParentMessage.id);
        
        // Notify parent component if callback is provided
        if (onThreadReply) {
          onThreadReply(newReply);
        }
      }
      
      return newReply;
    } catch (error) {
      console.error('Error sending thread reply:', error);
      return null;
    }
  }, [threadParentMessage, sendThreadReply, emitThreadReply, onThreadReply]);

  // Change active conversation
  const setConversation = useCallback((conversationId: string) => {
    setActiveConversation(conversationId);
    // Close thread when changing conversations
    setIsThreadOpen(false);
    setThreadParentMessage(null);
  }, []);

  return {
    // Conversation state
    activeConversation,
    setConversation,
    
    // Thread state and operations
    isThreadOpen,
    threadParentMessage,
    threadReplies,
    isLoadingReplies,
    openThreadForMessage,
    closeThread,
    handleSendThreadReply,
    
    // Socket state
    socketConnected,
    
    // Thread API methods exposed for direct use if needed
    getThreadReplies,
    markRepliesAsRead,
  };
}
