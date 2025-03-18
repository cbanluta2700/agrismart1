"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@saasfly/ui/button";
import { ScrollArea } from "@saasfly/ui/scroll-area";
import { cn, Chat } from "~/components/ai-assistant/utils";
import { Loader2, MessageSquare, Plus, Trash } from "~/components/ai-assistant/icons";
import { useRouter, useSearchParams } from "next/navigation";

interface ChatHistoryProps {
  className?: string;
}

export function ChatHistory({ className }: ChatHistoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chatId");
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch chat history
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/ai-assistant/chat-history");
        
        if (!response.ok) {
          throw new Error("Failed to fetch chat history");
        }
        
        const data = await response.json();
        setChats(data.chats || []);
      } catch (err) {
        console.error("Error fetching chats:", err);
        setError("Failed to load chat history");
      } finally {
        setLoading(false);
      }
    };
    
    fetchChats();
  }, []);
  
  // Create a new chat
  const handleNewChat = () => {
    router.push("/dashboard/ai-assistant");
  };
  
  // Select a chat
  const handleSelectChat = (chatId: string) => {
    router.push(`/dashboard/ai-assistant?chatId=${chatId}`);
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="px-4 py-2">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleNewChat}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="px-4 py-2 text-sm text-destructive">{error}</div>
        ) : chats.length === 0 ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            No chat history yet. Start a new conversation!
          </div>
        ) : (
          <div className="px-2 py-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent my-1 cursor-pointer",
                  chat.id === currentChatId && "bg-accent"
                )}
                onClick={() => handleSelectChat(chat.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="line-clamp-1 flex-1">{chat.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Delete functionality would go here
                  }}
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
