"use client";

import React from 'react';
import { Button } from "../button";
import { MoreHorizontal, Phone, Video, Search, ArrowLeft } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { Badge } from "../badge";
import { Separator } from "../separator";
import { cn } from "../utils/cn";

export interface ConversationHeaderProps {
  name: string;
  avatar?: string;
  online?: boolean;
  isGroup?: boolean;
  members?: number;
  typing?: boolean;
  typingUser?: string;
  isMobile?: boolean;
  onBack?: () => void;
  onInfoClick?: () => void;
  onSearchClick?: () => void;
}

export function ConversationHeader({
  name,
  avatar,
  online = false,
  isGroup = false,
  members = 0,
  typing = false,
  typingUser,
  isMobile = false,
  onBack,
  onInfoClick,
  onSearchClick
}: ConversationHeaderProps) {
  return (
    <div className="border-b border-border flex items-center justify-between px-4 py-2 h-16">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 md:hidden" 
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          {isGroup ? (
            <div className="relative">
              <UserAvatar 
                user={{ id: "group", name, image: avatar }} 
                size="md"
              />
              <Badge 
                variant="secondary" 
                className="absolute -bottom-2 -right-2 px-1.5 min-w-[20px] h-5"
              >
                {members}
              </Badge>
            </div>
          ) : (
            <UserAvatar 
              user={{ id: "user", name, image: avatar }} 
              size="md"
              showStatus={!isGroup}
              status={online ? "online" : "offline"}
            />
          )}
          
          <div className="flex flex-col">
            <h2 className="font-medium text-base leading-tight">{name}</h2>
            <span className={cn(
              "text-xs text-muted-foreground",
              typing && "text-primary animate-pulse"
            )}>
              {typing 
                ? `${typingUser || 'Someone'} is typing...` 
                : (online ? 'Online' : isGroup ? `${members} members` : 'Offline')
              }
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onSearchClick}
        >
          <Search className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Phone className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Video className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onInfoClick}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
