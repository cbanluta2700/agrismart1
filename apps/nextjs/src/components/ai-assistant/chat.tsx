"use client";

import React, { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { cn } from "~/components/ai-assistant/utils";
import { Button } from "@saasfly/ui/button";
import { Input } from "@saasfly/ui/input";
import { Textarea } from "@saasfly/ui/textarea";
import { ScrollArea } from "@saasfly/ui/scroll-area";
import { Bot, Loader2, SendIcon, User } from "~/components/ai-assistant/icons";
import { chatModels } from "@saasfly/ai-assistant";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import { Message } from "~/components/ai-assistant/utils";

interface ChatProps {
  id?: string;
  initialMessages?: Message[];
  className?: string;
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter();
  const [modelName, setModelName] = useState("gpt-4o");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Set up chat using the ai/react hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    stop,
    error,
  } = useChat({
    initialMessages,
    api: "/api/ai-assistant/chat",
    id,
    body: {
      id,
    },
    onFinish: async (message: Message) => {
      // If not on an existing chat, create a new chat entry
      if (!id) {
        const response: Response = await fetch(`/api/ai-assistant/chat-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: message.content.slice(0, 100),
            messages: [
              ...messages,
              {
                role: "assistant",
                content: message.content,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          append(data);
        }
      }
    },
    onResponse: (response: Response) => {
      if (response.status === 429) {
        stop();
        console.error("Rate limit exceeded");
      }
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Resize textarea as user types
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "inherit";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/ai-assistant/chat-history", {
        method: "GET",
      });
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to refresh chats:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4 p-4">
            {messages.length === 0 && (
              <div className="flex items-start gap-3 text-sm">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-2 overflow-hidden px-1">
                  <div className="prose dark:prose-invert prose-sm">
                    <p>
                      Hello! I'm your AgriSmart AI Assistant. I can help you with agricultural advice, 
                      crop management, sustainable farming practices, and more. How can I assist you today?
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.length > 0 ? (
              messages.map((message: Message, index: number) => {
                const isUser = message.role === "user";
                return (
                  <div key={index} className={`${isUser ? "justify-end" : "justify-start"} flex w-full`}>
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div
                      className={cn(
                        "flex flex-col space-y-2 overflow-hidden rounded-lg px-3 py-2",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose dark:prose-invert prose-sm">
                          <Markdown>{message.content}</Markdown>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-background">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                );
              })
            ) : null}

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-4 text-destructive">
                <p className="text-sm">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t p-4">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex items-end gap-2"
        >
          {error && (
            <div className="mb-4 rounded-md bg-destructive p-4 text-white">
              <p className="text-sm">{error.toString()}</p>
            </div>
          )}
          <div className="relative flex-1">
            <Textarea
              ref={inputRef}
              tabIndex={0}
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              spellCheck={false}
              className="min-h-10 resize-none bg-background pr-12 scrollbar-thumb-accent scrollbar-track-muted-foreground/10 scrollbar-thin"
            />
            <div className="absolute right-3 bottom-3">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ""}
                variant="ghost"
              >
                <SendIcon className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
