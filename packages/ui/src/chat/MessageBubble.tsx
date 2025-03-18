"use client";

import React from 'react';
import { UserAvatar } from './UserAvatar';
import { Check, CheckCheck, MessageSquare } from 'lucide-react';
import { cn } from '../utils/cn';
import { MessageReactions, MessageReaction } from './MessageReactions';
import { Button } from '../button';
import { AnimatedTooltip } from '../animated-tooltip';
import { AttachmentPreview, AttachmentType } from './AttachmentPreview';

export interface MessageBubbleProps {
  content: string;
  timestamp: Date | string;
  isOwn?: boolean;
  isRead?: boolean;
  senderName?: string;
  senderAvatar?: string;
  showSender?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'error';
  reactions?: MessageReaction[];
  currentUserId: string;
  onAddReaction?: (emoji: string) => void;
  onRemoveReaction?: (emoji: string) => void;
  userNames?: Record<string, string>;
  replyCount?: number;
  onReply?: () => void;
  messageId: string;
  attachments?: AttachmentType[];
}

export function MessageBubble({
  content,
  timestamp,
  isOwn = false,
  isRead = false,
  senderName,
  senderAvatar,
  showSender = false,
  status = 'sent',
  reactions = [],
  currentUserId,
  onAddReaction,
  onRemoveReaction,
  userNames = {},
  replyCount = 0,
  onReply,
  messageId,
  attachments = []
}: MessageBubbleProps) {
  const formattedTime = typeof timestamp === 'string'
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const hasAttachments = attachments.length > 0;

  return (
    <div className={cn(
      "flex mb-4 max-w-[80%] group",
      isOwn ? "ml-auto" : "mr-auto"
    )}>
      {!isOwn && showSender && (
        <div className="flex-shrink-0 mr-2 mt-auto">
          <UserAvatar 
            user={{ id: "", name: senderName, image: senderAvatar }}
            size="sm"
          />
        </div>
      )}

      <div className="flex flex-col">
        {!isOwn && showSender && senderName && (
          <span className="text-xs text-gray-500 mb-1">{senderName}</span>
        )}

        <div className={cn(
          "p-3 rounded-lg relative",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-br-none" 
            : "bg-secondary text-secondary-foreground rounded-bl-none",
        )}>
          {/* Message content */}
          <div className="whitespace-pre-wrap break-words">{content}</div>
          
          {/* File attachments */}
          {hasAttachments && (
            <div className={cn(
              "flex flex-col gap-2 mt-2",
              attachments.length > 1 && "border-t border-gray-200 pt-2"
            )}>
              {attachments.map((attachment) => (
                <AttachmentPreview 
                  key={attachment.id}
                  attachment={attachment}
                  compact={true}
                />
              ))}
            </div>
          )}

          {/* Time and status indicators */}
          <div className={cn(
            "flex items-center gap-1 text-xs opacity-70",
            isOwn ? "justify-end" : "justify-start",
            "mt-1"
          )}>
            <span>{formattedTime}</span>
            {isOwn && status !== 'error' && (
              <span>
                {status === 'read' ? (
                  <CheckCheck size={12} />
                ) : (
                  <Check size={12} />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Message reactions */}
        {reactions.length > 0 && (
          <div className={cn(
            "mt-1",
            isOwn ? "ml-auto" : "mr-auto"
          )}>
            <MessageReactions 
              messageId={messageId}
              reactions={reactions}
              currentUserId={currentUserId}
              onReactionSelect={(messageId, emoji) => onAddReaction?.(emoji)}
              onReactionRemove={(messageId, emoji) => onRemoveReaction?.(emoji)}
            />
          </div>
        )}

        {/* Thread reply indicator */}
        {replyCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 text-xs h-6 px-2 mt-1",
              isOwn ? "ml-auto" : "mr-auto"
            )}
            onClick={onReply}
          >
            <MessageSquare size={12} />
            <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
