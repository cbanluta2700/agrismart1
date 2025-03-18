"use client";

/**
 * Search Messages Component
 * 
 * Provides a UI for searching messages within conversations
 * and displaying search results.
 */

import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../input';
import { Button } from '../button';
import { ScrollArea } from '../scroll-area';
import type { ChatMessageType } from '@saasfly/chat';

interface SearchMessagesProps {
  onSearch: (query: string) => Promise<ChatMessageType[]>;
  onSelectResult: (message: ChatMessageType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SearchMessages({
  onSearch,
  onSelectResult,
  isOpen,
  onClose,
}: SearchMessagesProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatMessageType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  
  // Handle search submission
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setNoResults(false);
    
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
      setNoResults(searchResults.length === 0);
    } catch (error) {
      console.error('Error searching messages:', error);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch]);
  
  // Handle pressing enter in search input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);
  
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${date.toLocaleDateString([], { weekday: 'short' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };
  
  // Highlight matching text in the search results
  const highlightMatches = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    try {
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-700">$1</mark>');
    } catch (error) {
      return text;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="absolute inset-0 z-10 bg-background flex flex-col">
      <div className="p-3 border-b flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="pl-8 w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-2 border-b">
        <Button
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          size="sm"
          className="w-full"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {noResults ? (
          <div className="p-4 text-center text-muted-foreground">
            No results found for "{query}"
          </div>
        ) : results.length > 0 ? (
          <div className="divide-y">
            {results.map((message) => (
              <button
                key={message.id}
                className="p-4 text-left w-full hover:bg-muted/50 flex flex-col gap-1"
                onClick={() => onSelectResult(message)}
              >
                <div className="text-xs text-muted-foreground">
                  {formatTimestamp(message.createdAt)}
                </div>
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: highlightMatches(message.content, query)
                  }}
                />
              </button>
            ))}
          </div>
        ) : null}
      </ScrollArea>
    </div>
  );
}
