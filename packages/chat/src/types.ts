/**
 * Chat System Types
 * 
 * Defines the types used throughout the chat system for both
 * client and server side components.
 */

/**
 * Represents a conversation between a buyer and seller
 */
export interface ConversationType {
  id: string;
  buyerId: string;
  sellerId: string;
  title?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  productId?: string;
  productName?: string;
  productImageUrl?: string;
  unreadCount?: number;
  isGroup?: boolean;
  members?: string[];
  groupAdmin?: string;
}

/**
 * Represents a group conversation
 */
export interface GroupConversationType extends Omit<ConversationType, 'buyerId' | 'sellerId'> {
  isGroup: true;
  members: string[];
  groupAdmin: string;
  groupImage?: string;
  groupDescription?: string;
}

/**
 * Represents a message in a conversation
 */
export interface ChatMessageType {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  isRead: boolean;
  createdAt: string;
  replyTo?: string; // ID of the message this is replying to
  reactions?: MessageReaction[];
  replyCount?: number; // Count of replies to this message
}

/**
 * Represents a reaction to a message
 */
export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

/**
 * Represents a member of a group conversation
 */
export interface GroupMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

/**
 * Socket.io events for the chat system
 */
export enum ChatEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECTION_ERROR = 'connect_error',
  CONNECT_ERROR = 'connect_error', // Alias for CONNECTION_ERROR
  ERROR = 'error',
  
  // Message events
  MESSAGE = 'message',
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',
  MESSAGE_READ = 'message_read',
  MARK_READ = 'mark_read',
  MESSAGES_READ = 'messages_read',
  LOAD_MESSAGES = 'load_messages',
  
  // Typing events
  TYPING = 'typing',
  STOP_TYPING = 'stop_typing',
  
  // Conversation events
  JOIN_CONVERSATION = 'join_room',
  LEAVE_CONVERSATION = 'leave_room',
  
  // Group chat events
  CREATE_GROUP = 'create_group',
  GROUP_CREATED = 'group_created', 
  ADD_MEMBER = 'add_member',
  MEMBER_ADDED = 'member_added',
  REMOVE_MEMBER = 'remove_member',
  MEMBER_REMOVED = 'member_removed',
  EDIT_GROUP = 'edit_group',
  GROUP_UPDATED = 'group_updated',
  
  // User status events
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  ONLINE_STATUS = 'online_status',
  
  // Notification events
  NEW_NOTIFICATION = 'new_notification',
  CLEAR_NOTIFICATION = 'clear_notification',
  MARK_NOTIFICATION_READ = 'mark_notification_read',
  
  // Reaction events
  ADD_REACTION = 'add_reaction',
  REMOVE_REACTION = 'remove_reaction',
  
  // Thread events
  LOAD_THREAD = 'load_thread',
  THREAD_LOADED = 'thread_loaded',
  THREAD_REPLY = 'thread_reply',
  THREAD_REPLY_RECEIVED = 'thread_reply_received'
}

/**
 * Represents a notification
 */
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

/**
 * Types of notifications in the system
 */
export enum NotificationTypeEnum {
  NEW_MESSAGE = 'new_message',
  MENTION = 'mention',
  GROUP_INVITATION = 'group_invitation',
  GROUP_REMOVED = 'group_removed',
  NEW_GROUP_MEMBER = 'new_group_member',
  MESSAGE_REACTION = 'message_reaction',
  THREAD_REPLY = 'thread_reply',
  SYSTEM = 'system'
}

/**
 * Chat client configuration options
 */
export interface ChatClientOptions {
  endpoint?: string;
  auth?: {
    token: string;
  }
  token: string;
}
