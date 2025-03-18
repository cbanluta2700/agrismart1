/**
 * Socket.io Chat Server
 * 
 * This module implements a real-time chat server using Socket.io
 * with authentication middleware for secure communication.
 */

import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { getToken } from '@saasfly/auth';
import { 
  addChatMessage, 
  getChatConversationMessages,
  markMessagesAsRead,
  getUserChatConversations,
  getChatConversationById,
  getOrCreateChatConversation,
  createGroupConversation,
  addGroupConversationMember,
  removeGroupConversationMember,
  conversationParticipants
} from '@saasfly/db/chat-system';

// Define the authenticated socket type
export interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: string;
}

// Define event types for type-safe event handling
export enum ChatEvent {
  // Connection events
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  TYPING = 'typing',
  STOP_TYPING = 'stop_typing',
  
  // Message events
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',
  MARK_READ = 'mark_read',
  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGES_READ = 'messages_read',
  
  // User events
  ONLINE_STATUS = 'online_status',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  
  // Group chat events
  CREATE_GROUP = 'create_group',
  GROUP_CREATED = 'group_created',
  ADD_MEMBER = 'add_member',
  MEMBER_ADDED = 'member_added',
  REMOVE_MEMBER = 'remove_member',
  MEMBER_REMOVED = 'member_removed',
  
  // Error events
  ERROR = 'error'
}

// In-memory state for active users and typing indicators
const connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds
const userTypingStatus = new Map<string, Set<string>>(); // conversationId -> Set of userIds typing

/**
 * Initialize the Socket.io server with NextAuth authentication
 */
export function initializeSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket/chat',
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication failed: Token not provided'));
      }

      const session = await getToken(token);
      if (!session || !session.sub) {
        return next(new Error('Authentication failed: Invalid token'));
      }

      // Attach user data to the socket
      (socket as AuthenticatedSocket).userId = session.sub;
      (socket as AuthenticatedSocket).userRole = session.role || 'BUYER';

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;
    
    console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
    
    // Add to connected users map
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)?.add(socket.id);
    
    // Automatically join user to their conversations
    handleUserRooms(authSocket);
    
    // Broadcast user's online status to relevant parties
    broadcastUserStatus(userId, true);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}, Socket ID: ${socket.id}`);
      
      // Remove from connected users
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
          // Broadcast offline status when all of user's sockets are disconnected
          broadcastUserStatus(userId, false);
        }
      }
      
      // Clean up typing status
      for (const [conversationId, typingUsers] of userTypingStatus.entries()) {
        if (typingUsers.has(userId)) {
          typingUsers.delete(userId);
          socket.to(conversationId).emit(ChatEvent.STOP_TYPING, { userId });
        }
      }
    });
    
    // Handle joining a specific chat room
    socket.on(ChatEvent.JOIN_ROOM, async (conversationId: string) => {
      try {
        const conversation = await getChatConversationById(conversationId);
        
        // Verify that the user is allowed to join this conversation
        if (!conversation) {
          socket.emit(ChatEvent.ERROR, { message: 'Conversation not found' });
          return;
        }
        
        // Check if user is permitted in this conversation
        const canJoin = await isUserAllowedInConversation(userId, conversation);
        if (!canJoin) {
          socket.emit(ChatEvent.ERROR, { message: 'Not authorized to join this conversation' });
          return;
        }
        
        socket.join(conversationId);
        console.log(`User ${userId} joined room ${conversationId}`);
        
        // Mark messages as read when joining
        await markMessagesAsRead(conversationId, userId);
        
        // Notify other users about message read status
        socket.to(conversationId).emit(ChatEvent.MESSAGES_READ, { 
          conversationId, 
          userId 
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit(ChatEvent.ERROR, { message: 'Failed to join conversation' });
      }
    });
    
    // Handle leaving a chat room
    socket.on(ChatEvent.LEAVE_ROOM, (conversationId: string) => {
      socket.leave(conversationId);
      console.log(`User ${userId} left room ${conversationId}`);
    });
    
    // Handle new messages
    socket.on(ChatEvent.SEND_MESSAGE, async (data: { 
      conversationId: string; 
      content: string; 
      attachments?: any;
    }) => {
      try {
        const { conversationId, content, attachments } = data;
        
        // Verify that the user is allowed to send message to this conversation
        const conversation = await getChatConversationById(conversationId);
        if (!conversation) {
          socket.emit(ChatEvent.ERROR, { message: 'Conversation not found' });
          return;
        }
        
        // Check if user is permitted in this conversation
        const canSend = await isUserAllowedInConversation(userId, conversation);
        if (!canSend) {
          socket.emit(ChatEvent.ERROR, { message: 'Not authorized to send message to this conversation' });
          return;
        }
        
        // Store the message in the database
        const message = await addChatMessage(conversationId, userId, content, attachments);
        
        // Clear typing status
        const typingUsers = userTypingStatus.get(conversationId);
        if (typingUsers?.has(userId)) {
          typingUsers.delete(userId);
          socket.to(conversationId).emit(ChatEvent.STOP_TYPING, { userId });
        }
        
        // Broadcast the message to all users in the conversation
        io.to(conversationId).emit(ChatEvent.RECEIVE_MESSAGE, message);
        
        // Send delivery confirmation to the sender
        socket.emit(ChatEvent.MESSAGE_DELIVERED, { 
          messageId: message.id, 
          conversationId 
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit(ChatEvent.ERROR, { message: 'Failed to send message' });
      }
    });
    
    // Handle typing status
    socket.on(ChatEvent.TYPING, async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        
        // Verify that the user is allowed in this conversation
        const conversation = await getChatConversationById(conversationId);
        if (!conversation) return;
        
        const canType = await isUserAllowedInConversation(userId, conversation);
        if (!canType) return;
        
        // Update typing status
        if (!userTypingStatus.has(conversationId)) {
          userTypingStatus.set(conversationId, new Set());
        }
        
        const typingUsers = userTypingStatus.get(conversationId);
        if (!typingUsers?.has(userId)) {
          typingUsers?.add(userId);
          socket.to(conversationId).emit(ChatEvent.TYPING, { userId });
        }
      } catch (error) {
        console.error('Error handling typing status:', error);
      }
    });
    
    // Handle stopped typing
    socket.on(ChatEvent.STOP_TYPING, async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        
        // Remove from typing status
        const typingUsers = userTypingStatus.get(conversationId);
        if (typingUsers?.has(userId)) {
          typingUsers.delete(userId);
          socket.to(conversationId).emit(ChatEvent.STOP_TYPING, { userId });
        }
      } catch (error) {
        console.error('Error handling stop typing:', error);
      }
    });
    
    // Handle messages marked as read
    socket.on(ChatEvent.MARK_READ, async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;
        
        // Verify that the user is allowed in this conversation
        const conversation = await getChatConversationById(conversationId);
        if (!conversation) return;
        
        const canMarkRead = await isUserAllowedInConversation(userId, conversation);
        if (!canMarkRead) return;
        
        // Mark as read in database
        await markMessagesAsRead(conversationId, userId);
        
        // Notify others
        socket.to(conversationId).emit(ChatEvent.MESSAGES_READ, { 
          conversationId, 
          userId 
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
    
    // ========== GROUP CHAT FUNCTIONALITY ==========
    
    // Create a new group conversation
    socket.on(ChatEvent.CREATE_GROUP, async (data: {
      name: string;
      memberIds: string[];
      description?: string;
      iconUrl?: string;
    }) => {
      try {
        const { name, memberIds, description, iconUrl } = data;
        
        // Create the group in the database
        const group = await createGroupConversation(
          name,
          userId,
          memberIds,
          description,
          iconUrl
        );
        
        // Join the creator to the room
        socket.join(group.id);
        
        // Notify the creator about successful creation
        socket.emit(ChatEvent.GROUP_CREATED, group);
        
        // Find all members who are currently online and add them to the room
        for (const memberId of memberIds) {
          if (isUserOnline(memberId)) {
            notifyUserAboutGroup(memberId, group.id);
          }
        }
      } catch (error) {
        console.error('Error creating group:', error);
        socket.emit(ChatEvent.ERROR, { message: 'Failed to create group conversation' });
      }
    });
    
    // Add member to a group
    socket.on(ChatEvent.ADD_MEMBER, async (data: {
      conversationId: string;
      userId: string;
      role?: string;
    }) => {
      try {
        const { conversationId, userId: newMemberId, role } = data;
        
        // Verify user is an admin in this group
        const isAdmin = await isUserGroupAdmin(userId, conversationId);
        if (!isAdmin) {
          socket.emit(ChatEvent.ERROR, { message: 'Only group admins can add members' });
          return;
        }
        
        // Add the member to the group
        const participant = await addGroupConversationMember(
          conversationId,
          newMemberId,
          userId,
          role
        );
        
        // Notify all members about the new addition
        io.to(conversationId).emit(ChatEvent.MEMBER_ADDED, {
          conversationId,
          newMember: newMemberId,
          addedBy: userId,
          role: participant.role
        });
        
        // If the new member is online, add them to the room
        if (isUserOnline(newMemberId)) {
          notifyUserAboutGroup(newMemberId, conversationId);
        }
      } catch (error) {
        console.error('Error adding group member:', error);
        socket.emit(ChatEvent.ERROR, { message: 'Failed to add member to group' });
      }
    });
    
    // Remove member from a group
    socket.on(ChatEvent.REMOVE_MEMBER, async (data: {
      conversationId: string;
      userId: string;
    }) => {
      try {
        const { conversationId, userId: memberToRemoveId } = data;
        
        // Allow self-removal or admin removal
        const isSelf = userId === memberToRemoveId;
        const isAdmin = await isUserGroupAdmin(userId, conversationId);
        
        if (!isSelf && !isAdmin) {
          socket.emit(ChatEvent.ERROR, { message: 'Only group admins can remove other members' });
          return;
        }
        
        // Remove the member from the group
        await removeGroupConversationMember(
          conversationId,
          memberToRemoveId,
          userId
        );
        
        // Notify all members about the removal
        io.to(conversationId).emit(ChatEvent.MEMBER_REMOVED, {
          conversationId,
          removedMember: memberToRemoveId,
          removedBy: userId
        });
        
        // If the removed member is online, remove them from the room
        if (isUserOnline(memberToRemoveId)) {
          removeUserFromGroup(memberToRemoveId, conversationId);
        }
      } catch (error) {
        console.error('Error removing group member:', error);
        socket.emit(ChatEvent.ERROR, { message: 'Failed to remove member from group' });
      }
    });
  });
  
  return io;
}

/**
 * Automatically join the user to rooms for their conversations
 */
async function handleUserRooms(socket: AuthenticatedSocket) {
  try {
    const userId = socket.userId;
    const conversations = await getUserChatConversations(userId);
    
    // Join user to each conversation room
    for (const conversation of conversations) {
      socket.join(conversation.id);
      console.log(`User ${userId} auto-joined room ${conversation.id}`);
    }
  } catch (error) {
    console.error('Error setting up user rooms:', error);
  }
}

/**
 * Broadcast user's online status to relevant users
 */
function broadcastUserStatus(userId: string, isOnline: boolean) {
  // Find all conversations the user is part of
  getUserChatConversations(userId)
    .then(conversations => {
      conversations.forEach(conversation => {
        const event = isOnline ? ChatEvent.USER_ONLINE : ChatEvent.USER_OFFLINE;
        // Send to everyone in the conversation except the user
        const io = getSocketServer();
        if (io) {
          io.to(conversation.id).except(getUserSocketIds(userId)).emit(event, { userId });
        }
      });
    })
    .catch(error => console.error('Error broadcasting user status:', error));
}

/**
 * Check if a user is currently online
 */
function isUserOnline(userId: string): boolean {
  const userSockets = connectedUsers.get(userId);
  return !!userSockets && userSockets.size > 0;
}

/**
 * Get all socket IDs for a user
 */
function getUserSocketIds(userId: string): string[] {
  const userSockets = connectedUsers.get(userId);
  return userSockets ? Array.from(userSockets) : [];
}

/**
 * Get socket.io server instance (singleton)
 */
let socketServer: SocketServer | null = null;
export function getSocketServer(): SocketServer | null {
  return socketServer;
}

/**
 * Check if a user is allowed in a conversation
 */
async function isUserAllowedInConversation(userId: string, conversation: any): Promise<boolean> {
  // For direct conversations, check if user is buyer or seller
  if (!conversation.isGroup) {
    return conversation.buyerId === userId || conversation.sellerId === userId;
  }
  
  // For group conversations, check if user is in participants table
  try {
    const participantCheck = await sql`
      SELECT * FROM chat_conversation_participants
      WHERE conversation_id = ${conversation.id}
      AND user_id = ${userId}
      AND left_at IS NULL
    `;
    
    return participantCheck.rows.length > 0;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}

/**
 * Check if a user is an admin in a group conversation
 */
async function isUserGroupAdmin(userId: string, conversationId: string): Promise<boolean> {
  try {
    const adminCheck = await sql`
      SELECT * FROM chat_conversation_participants
      WHERE conversation_id = ${conversationId}
      AND user_id = ${userId}
      AND role = 'ADMIN'
      AND left_at IS NULL
    `;
    
    return adminCheck.rows.length > 0;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Notify an online user about a new group they were added to
 */
function notifyUserAboutGroup(userId: string, groupId: string) {
  const socketIds = getUserSocketIds(userId);
  const io = getSocketServer();
  
  if (io && socketIds.length > 0) {
    // Get the group info to send to the user
    getChatConversationById(groupId)
      .then(group => {
        // Emit to all user's sockets
        socketIds.forEach(socketId => {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            // Join the socket to the group room
            socket.join(groupId);
            // Notify about the new group
            socket.emit(ChatEvent.GROUP_CREATED, group);
          }
        });
      })
      .catch(error => console.error('Error getting group info:', error));
  }
}

/**
 * Remove a user from a group conversation room
 */
function removeUserFromGroup(userId: string, groupId: string) {
  const socketIds = getUserSocketIds(userId);
  const io = getSocketServer();
  
  if (io && socketIds.length > 0) {
    // Remove all user's sockets from the group room
    socketIds.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(groupId);
      }
    });
  }
}

// Set socket server instance when initialized
export function setSocketServer(io: SocketServer) {
  socketServer = io;
}
