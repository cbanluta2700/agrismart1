import React, { useEffect, useState } from "react";
import { X, CornerDownRight } from "lucide-react";
import { Button } from "../button";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { Separator } from "../separator";
import { ScrollArea } from "../scroll-area";
import { cn } from "../utils/cn";
import { useMessageThreads } from "./hooks/useMessageThreads";

export interface ThreadMessageType {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  isRead: boolean;
  createdAt: string;
  isReplyToId?: string;
  replyCount: number;
  reactions?: {
    userId: string;
    emoji: string;
    createdAt: string;
  }[];
}

export interface ThreadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  parentMessage?: ThreadMessageType;
  loadingMessages?: boolean;
  currentUserId: string;
  userMap: Record<string, { name: string; avatar?: string }>;
  onSendReply?: (content: string, attachments?: any) => void;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  className?: string;
  messages?: ThreadMessageType[];
}

export function ThreadPanel({
  isOpen,
  onClose,
  parentMessage,
  loadingMessages: initialLoadingState,
  currentUserId,
  userMap,
  onSendReply: externalSendReply,
  onAddReaction,
  onRemoveReaction,
  className,
  messages: externalMessages
}: ThreadPanelProps) {
  const [replyContent, setReplyContent] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [messages, setMessages] = useState<ThreadMessageType[]>([]);
  
  // Use our custom hook for thread management
  const {
    isLoadingReplies,
    getThreadReplies,
    sendThreadReply,
    markRepliesAsRead
  } = useMessageThreads();
  
  // Loading state will depend on both external and internal states
  const loadingMessages = initialLoadingState || isLoadingReplies;
  
  // Set focus to the input when the panel opens
  const inputContainerRef = React.useRef<HTMLDivElement>(null);
  
  // If external messages are provided, use those instead of fetching
  useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);
  
  // Fetch thread replies when a parent message is provided and no external messages
  useEffect(() => {
    async function fetchReplies() {
      if (!externalMessages && parentMessage && isOpen) {
        const replies = await getThreadReplies(parentMessage.id);
        setMessages(replies);
        
        // Mark replies as read when opening the thread
        await markRepliesAsRead(parentMessage.id);
      }
    }
    
    fetchReplies();
  }, [parentMessage?.id, isOpen, getThreadReplies, markRepliesAsRead, externalMessages]);
  
  useEffect(() => {
    if (isOpen && inputContainerRef.current) {
      const textarea = inputContainerRef.current.querySelector('textarea');
      if (textarea) {
        setTimeout(() => {
          textarea.focus();
        }, 100);
      }
    }
  }, [isOpen]);
  
  if (!isOpen || !parentMessage) {
    return null;
  }
  
  const parentSender = userMap[parentMessage.senderId] || { name: "Unknown User" };
  const isOwnMessage = parentMessage.senderId === currentUserId;
  
  const handleSendReply = async () => {
    if (replyContent.trim()) {
      // If there's an external handler, use it
      if (externalSendReply) {
        externalSendReply(replyContent, attachments.length > 0 ? attachments : undefined);
      } else {
        // Otherwise use our API-connected handler
        if (parentMessage) {
          const newReply = await sendThreadReply(
            parentMessage.id,
            replyContent,
            attachments.length > 0 ? attachments : undefined
          );
          
          if (newReply) {
            // Add the new reply to the local state
            setMessages(prev => [...prev, newReply]);
          }
        }
      }
      
      setReplyContent("");
      setAttachments([]);
    }
  };
  
  const userNames = Object.entries(userMap).reduce(
    (acc, [id, user]) => ({ ...acc, [id]: user.name }),
    {}
  );
  
  return (
    <div className={cn(
      "flex flex-col h-full border-l",
      className
    )}>
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <CornerDownRight className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Thread Replies</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close thread</span>
        </Button>
      </div>
      
      <div className="p-4 border-b">
        <MessageBubble
          messageId={parentMessage.id}
          content={parentMessage.content}
          timestamp={parentMessage.createdAt}
          isOwn={isOwnMessage}
          isRead={parentMessage.isRead}
          senderName={parentSender.name}
          senderAvatar={parentSender.avatar}
          showSender={!isOwnMessage}
          status={parentMessage.isRead ? "read" : "delivered"}
          reactions={parentMessage.reactions}
          currentUserId={currentUserId}
          onAddReaction={(emoji) => onAddReaction?.(parentMessage.id, emoji)}
          onRemoveReaction={(emoji) => onRemoveReaction?.(parentMessage.id, emoji)}
          userNames={userNames}
        />
      </div>
      
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
        <Separator className="flex-1" />
        <span>{messages.length} replies</span>
        <Separator className="flex-1" />
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin h-6 w-6 border-t-2 border-primary rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <CornerDownRight className="h-8 w-8 mb-2 opacity-50" />
            <p>No replies yet</p>
            <p className="text-sm">Be the first to reply</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => {
              const sender = userMap[message.senderId] || { name: "Unknown User" };
              const isOwn = message.senderId === currentUserId;
              
              return (
                <MessageBubble
                  key={message.id}
                  messageId={message.id}
                  content={message.content}
                  timestamp={message.createdAt}
                  isOwn={isOwn}
                  isRead={message.isRead}
                  senderName={sender.name}
                  senderAvatar={sender.avatar}
                  showSender={!isOwn}
                  status={message.isRead ? "read" : "delivered"}
                  reactions={message.reactions}
                  currentUserId={currentUserId}
                  onAddReaction={(emoji) => onAddReaction?.(message.id, emoji)}
                  onRemoveReaction={(emoji) => onRemoveReaction?.(message.id, emoji)}
                  userNames={userNames}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-2 border-t mt-auto">
        <MessageInput
          ref={inputContainerRef}
          value={replyContent}
          onChange={setReplyContent}
          onSend={handleSendReply}
          placeholder="Reply to thread..."
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          showSendButton
        />
      </div>
    </div>
  );
}
