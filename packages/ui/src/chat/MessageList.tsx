import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../scroll-area';
import { cn } from '../utils/cn';

interface Message {
  id: string;
  content: string;
  createdAt: Date | string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  isRead?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'error';
}

export interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
  groupedView?: boolean;
}

export function MessageList({
  messages,
  currentUserId,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  className,
  groupedView = true
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingTriggerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Set up infinite scroll for loading older messages
  useEffect(() => {
    if (hasMore && onLoadMore) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && !isLoading && onLoadMore) {
            onLoadMore();
          }
        },
        { threshold: 0.5 }
      );

      if (loadingTriggerRef.current && observerRef.current) {
        observerRef.current.observe(loadingTriggerRef.current);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, onLoadMore, isLoading]);

  // Group messages by sender for cleaner UI
  const groupedMessages = groupedView ? groupMessagesBySender(messages) : messages.map(msg => [msg]);

  return (
    <ScrollArea
      ref={scrollRef}
      className={cn("h-full px-4 py-4", className)}
    >
      {hasMore && (
        <div
          ref={loadingTriggerRef}
          className="flex justify-center py-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs text-muted-foreground">Loading messages...</span>
            </div>
          ) : (
            <div className="h-4" />
          )}
        </div>
      )}

      {groupedMessages.map((group, groupIndex) => {
        const isOwn = group[0]?.senderId === currentUserId;
        
        return (
          <div key={`group-${groupIndex}`} className="mb-4">
            {group.map((message, msgIndex) => (
              <MessageBubble
                key={message.id}
                messageId={message.id}
                content={message.content}
                timestamp={message.createdAt}
                isOwn={isOwn}
                isRead={message.isRead}
                senderName={message.senderName}
                senderAvatar={message.senderAvatar}
                status={message.status}
                showSender={msgIndex === 0 && !isOwn}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        );
      })}

      {isLoading && !hasMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {messages.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
          <p>No messages yet</p>
          <span className="text-xs">Start the conversation by sending a message</span>
        </div>
      )}
    </ScrollArea>
  );
}

// Helper function to group messages by sender with a time threshold
function groupMessagesBySender(messages: Message[]): Message[][] {
  if (messages.length === 0) return [];

  const result: Message[][] = [];
  let currentGroup: Message[] = [];
  
  // Make sure the first message exists before adding it to the group
  if (messages[0]) {
    currentGroup.push(messages[0]);
  }

  for (let i = 1; i < messages.length; i++) {
    const currentMessage = messages[i];
    const previousMessage = messages[i - 1];
    
    // Skip if either message is undefined
    if (!currentMessage || !previousMessage) continue;
    
    // Group messages if same sender and within 5 minutes
    const sameUser = currentMessage.senderId === previousMessage.senderId;
    const prevTime = new Date(previousMessage.createdAt).getTime();
    const currentTime = new Date(currentMessage.createdAt).getTime();
    const timeGap = (currentTime - prevTime) / (1000 * 60); // in minutes
    
    if (sameUser && timeGap < 5) {
      currentGroup.push(currentMessage);
    } else {
      if (currentGroup.length > 0) {
        result.push([...currentGroup]);
      }
      currentGroup = [currentMessage];
    }
  }
  
  if (currentGroup.length > 0) {
    result.push(currentGroup);
  }
  return result;
}
