/**
 * Message Panel Component
 * 
 * Displays the messages in a conversation and provides a form for sending new messages.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Paperclip, Image } from 'lucide-react';
import { ChatMessageType, ConversationType } from '@saasfly/chat';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { ScrollArea } from '../scroll-area';
import { useToast } from '../use-toast';
import { MessageBubble } from './MessageBubble';
import { AttachmentType } from './AttachmentPreview';
import { UploadingFile } from './MessageInput';

interface MessagePanelProps {
  conversation: ConversationType;
  messages: ChatMessageType[];
  onSendMessage: (content: string, attachments?: any) => void;
  onTyping: (isTyping: boolean) => void;
  typingUsers: Set<string>;
  isConnected: boolean;
  loadMoreMessages: () => Promise<ChatMessageType[]>;
  currentUserId?: string;
  onFileUpload?: (file: File, conversationId: string, onProgress: (progress: number) => void) => Promise<AttachmentType | null>;
  onCancelUpload?: (fileId: string) => void;
  uploadingFiles?: Record<string, UploadingFile>;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
}

export function MessagePanel({
  conversation,
  messages,
  onSendMessage,
  onTyping,
  typingUsers,
  isConnected,
  loadMoreMessages,
  currentUserId,
  onFileUpload,
  onCancelUpload,
  uploadingFiles = {},
  onAddReaction,
  onRemoveReaction
}: MessagePanelProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messageContent, setMessageContent] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userId = currentUserId || session?.user?.id || '';
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);
  
  // Handle loading more messages
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    try {
      setIsLoadingMore(true);
      const newMessages = await loadMoreMessages();
      setHasMoreMessages(newMessages.length > 0);
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load more messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  // Handle typing indicator
  const handleTyping = () => {
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing status
    onTyping(true);
    
    // Set timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageContent.trim() && attachments.length === 0) return;
    
    // Send the message
    onSendMessage(
      messageContent.trim(),
      attachments.length > 0 ? attachments : undefined
    );
    
    // Clear the input and attachments
    setMessageContent('');
    setAttachments([]);
    
    // Stop typing indicator
    onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Convert FileList to Array
    const fileList = Array.from(e.target.files);
    
    // Only allow up to 5 files
    if (attachments.length + fileList.length > 5) {
      toast({
        title: 'Too many files',
        description: 'You can only attach up to 5 files',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file sizes (max 10MB each)
    const oversizedFiles = fileList.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: 'Files too large',
        description: 'Files must be smaller than 10MB each',
        variant: 'destructive',
      });
      return;
    }
    
    // TODO: Upload files to storage service and add URLs to attachments
    // For now, just add file metadata
    const newAttachments = fileList.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      // In a real implementation, this would be replaced with the uploaded file URL
      url: URL.createObjectURL(file),
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle removing an attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Format message timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { [date: string]: ChatMessageType[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  }, [messages]);
  
  // Get the other user's ID (buyer or seller)
  const otherUserId = conversation.buyerId === userId
    ? conversation.sellerId
    : conversation.buyerId;
  
  return (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>
              {otherUserId.substring(0, 2).toUpperCase()}
            </AvatarFallback>
            <AvatarImage src={`/api/user/${otherUserId}/avatar`} />
          </Avatar>
          <div>
            <h2 className="font-semibold">
              {conversation.title || `Conversation with ${otherUserId}`}
            </h2>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {/* Load more button */}
        {hasMoreMessages && (
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load older messages'}
            </Button>
          </div>
        )}
        
        {/* Messages grouped by date */}
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            <div className="flex justify-center my-4">
              <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                {date === new Date().toLocaleDateString() ? 'Today' : date}
              </div>
            </div>
            
            {dateMessages.map((message) => {
              const isCurrentUser = message.senderId === userId;
              
              return (
                <div
                  key={message.id}
                  className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[80%]`}>
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.senderId.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                        <AvatarImage src={`/api/user/${message.senderId}/avatar`} />
                      </Avatar>
                    )}
                    
                    <div className={`
                      flex flex-col
                      ${isCurrentUser 
                        ? 'items-end bg-primary text-primary-foreground' 
                        : 'items-start bg-secondary text-secondary-foreground'}
                      px-3 py-2 rounded-lg
                    `}>
                      <div className="whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      
                      {/* Attachments if any */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {message.attachments.map((attachment: any, i: number) => (
                            <div key={i} className="relative">
                              {attachment.type.startsWith('image/') ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="h-20 w-20 object-cover rounded border"
                                />
                              ) : (
                                <div className="h-20 w-20 flex items-center justify-center bg-muted rounded border">
                                  <span className="text-xs truncate p-1">
                                    {attachment.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isCurrentUser && message.isRead && (
                          <span>✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="flex items-end gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {otherUserId.substring(0, 2).toUpperCase()}
              </AvatarFallback>
              <AvatarImage src={`/api/user/${otherUserId}/avatar`} />
            </Avatar>
            <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-lg">
              <div className="flex gap-1">
                <span className="animate-bounce">•</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>•</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      {/* Message input */}
      <div className="p-3 border-t">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative group">
                {attachment.type.startsWith('image/') ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-16 w-16 object-cover rounded border"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-muted rounded border">
                    <span className="text-xs truncate p-1">
                      {attachment.name}
                    </span>
                  </div>
                )}
                <button
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground h-5 w-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              placeholder="Type a message..."
              className="min-h-[42px] max-h-[120px] resize-none"
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!isConnected}
            />
          </div>
          
          <div className="flex items-end gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            />
            
            <Button
              variant="outline"
              size="icon"
              type="button"
              disabled={!isConnected || attachments.length >= 5}
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              type="button"
              disabled={!isConnected || attachments.length >= 5}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current.click();
                  fileInputRef.current.accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt";
                }
              }}
              title="Attach images"
            >
              <Image className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              size="icon"
              disabled={!isConnected || (!messageContent.trim() && attachments.length === 0)}
              onClick={handleSendMessage}
              title="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
