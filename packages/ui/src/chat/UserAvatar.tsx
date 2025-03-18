import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { cn } from "../utils/cn";

// Define our own User type interface instead of relying on Prisma
interface ChatUser {
  id: string;
  name?: string | null;
  image?: string | null;
  email?: string | null;
}

interface UserAvatarProps {
  user: ChatUser;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
}

export function UserAvatar({ 
  user, 
  className, 
  size = "md", 
  showStatus = false,
  status = "offline" 
}: UserAvatarProps) {
  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return (user?.email?.charAt(0) || "U").toUpperCase();
  };

  const getSizeClass = () => {
    switch(size) {
      case "xs": return "h-6 w-6 text-xs";
      case "sm": return "h-8 w-8 text-sm";
      case "lg": return "h-12 w-12 text-lg";
      default: return "h-10 w-10 text-base";
    }
  };
  
  const statusClass = showStatus ? "relative" : "";

  return (
    <div className={statusClass}>
      <Avatar className={cn(getSizeClass(), className)}>
        <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span 
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white", 
            status === "online" ? "bg-green-500" : 
            status === "away" ? "bg-yellow-500" : "bg-gray-500"
          )}
        />
      )}
    </div>
  );
}
