"use client";

/**
 * Chat Container Component
 * 
 * This is the main container for the chat interface, handling the layout
 * and orchestration of the conversation list and message display.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useChat, ConversationType, ChatMessageType } from '@saasfly/chat';
import { ConversationList } from './ConversationList';
import { MessagePanel } from './MessagePanel';
import { EmptyState } from './EmptyState';
import { AttachmentType } from './AttachmentPreview';
import { UploadingFile } from './MessageInput';
import { useToast } from '../use-toast';

interface ChatContainerProps {
  initialConversationId?: string;
  apiBasePath?: string;
}

export function ChatContainer({ 
  initialConversationId,
  apiBasePath = '/api/chat'
}: ChatContainerProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [activeConversation, setActiveConversation] = useState<ConversationType | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, UploadingFile>>({});
  
  // Get token from session
  const token = session?.user ? (session as any).accessToken || null : null;
  
  // Initialize chat 
  const {
    connected,
    connecting,
    error,
    conversations,
    messages,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsRead,
    sendTypingStatus,
    typingUsers,
    fetchMessages,
    fetchConversations,
    addReaction,
    removeReaction,
  } = useChat();
  
  // Load conversations when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations();
    }
  }, [session?.user?.id, fetchConversations]);
  
  // Set active conversation when initialConversationId is provided or when conversations are loaded
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === initialConversationId);
      if (conversation) {
        setActiveConversation(conversation);
        joinConversation(conversation.id);
        fetchMessages(conversation.id);
      }
    }
  }, [initialConversationId, conversations, joinConversation, fetchMessages]);
  
  // Handle conversation selection
  const handleSelectConversation = (conversation: ConversationType) => {
    // Leave previous conversation room if any
    if (activeConversation) {
      leaveConversation(activeConversation.id);
    }
    
    setActiveConversation(conversation);
    joinConversation(conversation.id);
    fetchMessages(conversation.id);
    markMessageAsRead(conversation.id);
  };
  
  // Handle file upload with progress tracking
  const handleFileUpload = useCallback(async (
    file: File, 
    conversationId: string,
    onProgress: (progress: number) => void
  ): Promise<AttachmentType | null> => {
    if (!token) return null;
    
    // Create form data for the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    
    try {
      // Use XMLHttpRequest to track upload progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve({
                id: response.id,
                name: response.filename,
                size: response.size,
                type: response.contentType,
                url: response.url,
              });
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });
        
        xhr.open('POST', `${apiBasePath}/upload`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
      return null;
    }
  }, [token, apiBasePath, toast]);
  
  // Handle cancelling an upload
  const handleCancelUpload = useCallback((fileId: string) => {
    setUploadingFiles(prev => {
      const newFiles = { ...prev };
      if (newFiles[fileId]) {
        newFiles[fileId] = {
          ...newFiles[fileId],
          status: 'cancelled' as const,
        };
      }
      return newFiles;
    });
  }, []);
  
  // Handle sending new messages
  const handleSendMessage = useCallback((content: string, attachments?: File[]) => {
    if (!activeConversation) return;
    
    sendMessage(activeConversation.id, content, attachments);
  }, [activeConversation, sendMessage]);
  
  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!activeConversation) return;
    
    sendTypingStatus(activeConversation.id, true);
  }, [activeConversation, sendTypingStatus]);
  
  // Handle adding reaction to a message
  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    if (!session?.user?.id) return;
    
    addReaction(messageId, emoji);
  }, [session?.user?.id, addReaction]);
  
  // Handle removing reaction from a message
  const handleRemoveReaction = useCallback((messageId: string, emoji: string) => {
    if (!session?.user?.id) return;
    
    removeReaction(messageId, emoji);
  }, [session?.user?.id, removeReaction]);
  
  return (
    <div className="flex h-[80vh] border rounded-lg overflow-hidden shadow-sm">
      {/* Conversation List */}
      <div className="w-1/3 border-r">
        <ConversationList 
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          onSelectConversation={handleSelectConversation}
          onRefresh={fetchConversations}
        />
      </div>
      
      {/* Message Panel or Empty State */}
      <div className="w-2/3 flex flex-col">
        {activeConversation ? (
          <MessagePanel
            conversation={activeConversation}
            messages={messages.filter(m => m.conversationId === activeConversation.id)}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            typingUsers={typingUsers.get(activeConversation?.id ?? '') || new Set()}
            isConnected={connected}
            currentUserId={session?.user?.id || ''}
            onFileUpload={handleFileUpload}
            onCancelUpload={handleCancelUpload}
            uploadingFiles={uploadingFiles}
            onAddReaction={handleAddReaction}
            onRemoveReaction={handleRemoveReaction}
            loadMoreMessages={() => {
              if (activeConversation) {
                return fetchMessages(activeConversation.id, 
                  messages.length > 0 && messages[0]?.createdAt
                    ? new Date(messages[0].createdAt) 
                    : undefined
                );
              }
              return Promise.resolve([]);
            }}
          />
        ) : (
          <EmptyState 
            title="Select a conversation"
            description="Choose a conversation from the list or start a new one to begin chatting."
          />
        )}
      </div>
    </div>
  );
}
