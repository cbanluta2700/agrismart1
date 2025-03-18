"use client";

import React, { useEffect } from "react";
import { 
  Bell, 
  MessageSquare, 
  Users, 
  User,
  CheckCircle 
} from "lucide-react";
import { Popover } from "../popover";
import { PopoverContent } from "../popover";
import { PopoverTrigger } from "../popover";
import { Button } from "../button";
import { Badge } from "../badge";
import { formatDistanceToNow } from "date-fns";

// Define types locally since we can't import from @agrismart/chat directly in UI package
export enum NotificationTypeEnum {
  NEW_MESSAGE = 'new_message',
  GROUP_INVITATION = 'group_invitation',
  MENTIONED = 'mentioned',
  GROUP_MEMBER_ADDED = 'group_member_added',
  GROUP_MEMBER_REMOVED = 'group_member_removed',
  GROUP_MEMBER_PROMOTED = 'group_member_promoted',
  NEW_GROUP_CREATED = 'new_group_created'
}

export interface NotificationType {
  id: string;
  userId: string;
  type: NotificationTypeEnum;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  notifications: NotificationType[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onClearAll
}: NotificationCenterProps) {
  // Auto refresh every minute to update "time ago" text
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render
      const forceUpdate = {};
      setState(forceUpdate);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // For re-rendering the component
  const [state, setState] = React.useState({});
  
  const getNotificationIcon = (type: NotificationTypeEnum) => {
    switch (type) {
      case NotificationTypeEnum.NEW_MESSAGE:
        return <MessageSquare className="h-4 w-4" />;
      case NotificationTypeEnum.GROUP_INVITATION:
      case NotificationTypeEnum.NEW_GROUP_CREATED:
        return <Users className="h-4 w-4" />;
      case NotificationTypeEnum.MENTIONED:
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
            >
              Clear all
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">New notifications will appear here</p>
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-3 border-b last:border-0 flex gap-3 ${
                    !notification.isRead ? "bg-muted/30" : ""
                  }`}
                >
                  <div className="mt-1">
                    <div className="bg-muted rounded-full p-2">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
