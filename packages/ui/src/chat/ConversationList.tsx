"use client";

/**
 * Conversation List Component
 * 
 * Displays a list of chat conversations and allows the user to select one.
 */

import React from 'react';
import { ConversationType } from '@saasfly/chat';
import { RefreshCw, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Button } from '../button';
import { Input } from '../input';

interface ConversationListProps {
  conversations: ConversationType[];
  activeConversationId?: string;
  onSelectConversation: (conversation: ConversationType) => void;
  onRefresh: () => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onRefresh,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter conversations by search query
  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return conversations.filter(conversation => 
      conversation.title?.toLowerCase().includes(lowercaseQuery) || 
      conversation.lastMessage?.toLowerCase().includes(lowercaseQuery)
    );
  }, [conversations, searchQuery]);
  
  // Format conversation timestamp
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with search and refresh */}
      <div className="p-3 border-b">
        <h2 className="text-lg font-semibold mb-2">Conversations</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh} 
            title="Refresh conversations"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No conversations found
          </div>
        ) : (
          <ul className="divide-y">
            {filteredConversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              
              // Determine the other participant (buyer or seller)
              const isUserSeller = conversation.sellerId === "CURRENT_USER_ID"; // Replace with actual user ID check
              const otherParticipantId = isUserSeller ? conversation.buyerId : conversation.sellerId;
              
              return (
                <li 
                  key={conversation.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 ${isActive ? 'bg-muted' : ''}`}
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {otherParticipantId.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                      <AvatarImage src={`/api/user/${otherParticipantId}/avatar`} />
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">
                          {conversation.title || `Conversation ${conversation.id.substring(0, 8)}`}
                        </h3>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {formatTimestamp(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
