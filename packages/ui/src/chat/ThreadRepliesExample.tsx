"use client";

import React, { useState, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { cn } from '../utils/cn';
import { ScrollArea } from '../scroll-area';
import { MessageInput } from './MessageInput';
import { ThreadMessageType, ThreadPanel } from './ThreadPanel';

interface ThreadRepliesExampleProps {
  conversationId: string;
  userId: string;
  className?: string;
}

// Define interface for chat hook to avoid import issues
interface ChatHook {
  activeConversation: any;
  setConversation: (id: string) => void;
  isThreadOpen: boolean;
  threadParentMessage: ThreadMessageType | null;
  threadReplies: ThreadMessageType[];
  isLoadingReplies: boolean;
  openThreadForMessage: (message: ThreadMessageType) => void;
  closeThread: () => void;
  handleSendThreadReply: (content: string, attachments?: any[]) => Promise<any>;
  socketConnected: boolean;
}

/**
 * Example component showing how to integrate thread replies in a chat interface
 */
export function ThreadRepliesExample({
  conversationId,
  userId,
  className
}: ThreadRepliesExampleProps) {
  const [messages, setMessages] = useState<ThreadMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  
  // Sample user data - in a real implementation, this would come from your user service
  const userMap: Record<string, { name: string; avatar: string }> = {
    'user-1': { 
      name: 'Alex Johnson', 
      avatar: '/avatars/alex.jpg' 
    },
    'user-2': { 
      name: 'Taylor Smith', 
      avatar: '/avatars/taylor.jpg' 
    },
    // Add your current user
    [userId]: { 
      name: 'You', 
      avatar: '/avatars/you.jpg' 
    }
  };
  
  // Mock implementation of useChat hook for this example
  const mockChatHook: ChatHook = {
    activeConversation: { id: conversationId },
    setConversation: (id: string) => console.log('Setting conversation:', id),
    isThreadOpen: false,
    threadParentMessage: null,
    threadReplies: [],
    isLoadingReplies: false,
    openThreadForMessage: (message: ThreadMessageType) => console.log('Opening thread for:', message),
    closeThread: () => console.log('Closing thread'),
    handleSendThreadReply: async (content: string, attachments?: any[]) => {
      console.log('Sending reply:', content, attachments);
      return null;
    },
    socketConnected: true
  };
  
  // Use our mock hook implementation
  const {
    activeConversation,
    setConversation,
    isThreadOpen,
    threadParentMessage,
    threadReplies,
    isLoadingReplies,
    openThreadForMessage,
    closeThread,
    handleSendThreadReply,
    socketConnected
  } = mockChatHook;
  
  // Mock handlers for receiving messages
  const handleNewMessage = (message: ThreadMessageType) => {
    console.log('New message received:', message);
    setMessages(prev => [...prev, message]);
  };
  
  const handleThreadReply = (reply: ThreadMessageType) => {
    console.log('New thread reply:', reply);
    setMessages(prev => prev.map(msg => 
      msg.id === reply.isReplyToId 
        ? { ...msg, replyCount: (msg.replyCount || 0) + 1 }
        : msg
    ));
  };
  
  // Set the active conversation when the component mounts
  useEffect(() => {
    setConversation(conversationId);
  }, [conversationId, setConversation]);
  
  // Fetch messages for the current conversation
  // In a real implementation, this would use trpc.messages.getConversationMessages.query
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        // Example data - replace with actual API call
        const sampleMessages: ThreadMessageType[] = [
          {
            id: 'msg-1',
            conversationId,
            senderId: 'user-1',
            content: "Hey there! How's the AgriSmart project coming along?",
            isRead: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            replyCount: 2
          },
          {
            id: 'msg-2',
            conversationId,
            senderId: userId,
            content: 'Great! I just finished implementing the thread replies feature.',
            isRead: true,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            replyCount: 0
          },
          {
            id: 'msg-3',
            conversationId,
            senderId: 'user-2',
            content: 'That sounds awesome! Can you show me how it works?',
            isRead: false,
            createdAt: new Date(Date.now() - 900000).toISOString(),
            replyCount: 0
          }
        ];
        
        setMessages(sampleMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeConversation) {
      fetchMessages();
    }
  }, [activeConversation, userId]);
  
  // Send a new message to the conversation
  // In a real implementation, this would use trpc.messages.sendMessage.mutate
  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      // Example implementation - replace with actual API call
      const newMessage: ThreadMessageType = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId: userId,
        content: messageInput,
        isRead: false,
        createdAt: new Date().toISOString(),
        replyCount: 0,
        attachments: attachments.length > 0 ? attachments : undefined
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      setAttachments([]);
    }
  };

  return (
    <div className={cn("flex h-[600px] border rounded-lg", className)}>
      {/* Main conversation area */}
      <div className="flex flex-col flex-1">
        <div className="p-3 border-b">
          <h3 className="font-medium">Conversation</h3>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(message => (
                <MessageBubble
                  key={message.id}
                  messageId={message.id}
                  content={message.content}
                  timestamp={message.createdAt}
                  isOwn={message.senderId === userId}
                  isRead={message.isRead}
                  senderName={userMap[message.senderId]?.name}
                  senderAvatar={userMap[message.senderId]?.avatar}
                  showSender={message.senderId !== userId}
                  status={message.isRead ? 'read' : 'delivered'}
                  currentUserId={userId}
                  replyCount={message.replyCount}
                  onReply={() => openThreadForMessage(message)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t mt-auto">
          <MessageInput
            value={messageInput}
            onChange={setMessageInput}
            onSend={handleSendMessage}
            placeholder="Type a message..."
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            showSendButton
          />
        </div>
      </div>
      
      {/* Thread panel */}
      {isThreadOpen && threadParentMessage && (
        <div className="w-80 border-l">
          <ThreadPanel
            isOpen={isThreadOpen}
            onClose={closeThread}
            parentMessage={threadParentMessage}
            loadingMessages={isLoadingReplies}
            currentUserId={userId}
            userMap={userMap}
            onSendReply={handleSendThreadReply}
            messages={threadReplies}
          />
        </div>
      )}
    </div>
  );
}
