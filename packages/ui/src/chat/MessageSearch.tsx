"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '../input';
import { Button } from '../button';
import { Search, X, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export interface MessageSearchResult {
  id: string;
  content: string;
  timestamp: string | Date;
  senderId: string;
  senderName?: string;
}

export interface MessageSearchProps {
  onSearch: (query: string) => Promise<MessageSearchResult[]>;
  onResultSelect?: (messageId: string) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export function MessageSearch({
  onSearch,
  onResultSelect,
  onClose,
  isOpen,
  className
}: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MessageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
      setError(null);
    }
  }, [isOpen]);

  // Auto focus the input when opened
  useEffect(() => {
    if (isOpen) {
      const input = document.querySelector('input[name="message-search"]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
      setSelectedIndex(searchResults.length > 0 ? 0 : -1);
    } catch (err) {
      setError('Failed to search messages. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    }
  };

  const selectResult = (index: number) => {
    setSelectedIndex(index);
    if (onResultSelect && results[index]) {
      onResultSelect(results[index].id);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | Date): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "p-4 border border-border rounded-lg bg-background shadow-md w-full max-w-md",
      className
    )}>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-grow">
          <Input
            name="message-search"
            placeholder="Search messages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Searching messages...</span>
        </div>
      )}

      {error && !isSearching && (
        <div className="text-destructive text-sm my-4 text-center">
          {error}
        </div>
      )}

      {!isSearching && results.length === 0 && query.trim() && !error && (
        <div className="text-muted-foreground text-sm my-4 text-center">
          No messages found matching "{query}"
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <>
          <div className="text-xs text-muted-foreground mb-2">
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Navigate: </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => selectResult((selectedIndex - 1 + results.length) % results.length)}
                disabled={results.length <= 1}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => selectResult((selectedIndex + 1) % results.length)}
                disabled={results.length <= 1}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
              <span>{selectedIndex + 1}/{results.length}</span>
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto space-y-2">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={cn(
                  "p-3 rounded-md cursor-pointer hover:bg-muted transition-colors",
                  selectedIndex === index ? "bg-muted border border-border" : ""
                )}
                onClick={() => selectResult(index)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm">{result.senderName || 'User'}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(result.timestamp)}
                  </span>
                </div>
                <p className="text-sm line-clamp-2">
                  {highlightQuery(result.content, query)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to highlight the query in the result text
function highlightQuery(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <span key={i} className="bg-yellow-200 dark:bg-yellow-800 dark:text-white">{part}</span>
    ) : (
      part
    )
  );
}
