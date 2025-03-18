"use client";

import React, { useState } from "react";
import { Smile, Plus } from "lucide-react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { cn } from "../utils/cn";

// Common emoji choices for reactions
const COMMON_EMOJIS = ["👍", "👎", "😀", "😂", "😍", "🙌", "🔥", "❤️", "👏", "🎉"];

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  userIds: string[];
  userReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: MessageReaction[];
  currentUserId: string;
  onReactionSelect: (messageId: string, emoji: string) => void;
  onReactionRemove: (messageId: string, emoji: string) => void;
  className?: string;
}

export function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onReactionSelect,
  onReactionRemove,
  className
}: MessageReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Group reactions by emoji
  const reactionGroups = React.useMemo(() => {
    const groups: Record<string, ReactionGroup> = {};
    
    reactions.forEach(reaction => {
      // Create an entry if it doesn't exist
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          userIds: [],
          userReacted: false
        };
      }
      
      // Store reference to the group to avoid repeated index access
      const group = groups[reaction.emoji];
      if (group) {
        group.count++;
        group.userIds.push(reaction.userId);
        
        if (reaction.userId === currentUserId) {
          group.userReacted = true;
        }
      }
    });
    
    return Object.values(groups);
  }, [reactions, currentUserId]);

  const handleReactionClick = (emoji: string, alreadyReacted: boolean) => {
    if (alreadyReacted) {
      onReactionRemove(messageId, emoji);
    } else {
      onReactionSelect(messageId, emoji);
    }
  };

  const formatReactionTooltip = (group: ReactionGroup) => {
    return `${group.count} ${group.count === 1 ? 'reaction' : 'reactions'}`;
  };

  return (
    <div className={cn("flex flex-wrap gap-1 mt-1", className)}>
      {reactionGroups.map(group => (
        <div key={group.emoji} className="relative group">
          <div className="absolute -top-8 scale-0 transition-all rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 z-50">
            {formatReactionTooltip(group)}
          </div>
          <Button
            variant={group.userReacted ? "secondary" : "outline"}
            size="sm"
            className="h-6 px-2 rounded-full"
            onClick={() => handleReactionClick(group.emoji, group.userReacted)}
          >
            <span className="mr-1">{group.emoji}</span>
            <span className="text-xs">{group.count}</span>
          </Button>
        </div>
      ))}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 w-6 p-0 rounded-full">
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                className="p-1 hover:bg-muted rounded text-lg"
                onClick={() => {
                  handleReactionClick(emoji, false);
                  setIsOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
