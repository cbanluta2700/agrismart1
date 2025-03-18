/**
 * Socket.io Chat Client
 * 
 * This module provides React hooks for connecting to the chat server
 * and interacting with the Socket.io-based real-time messaging system.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { 
  ChatEvents, 
  ConversationType, 
  ChatMessageType, 
  GroupConversationType,
  NotificationType,
  MessageReaction,
  GroupMember
} from './types';

// Re-export types for consumers
export * from './types';

/**
 * React hook for using the chat system
 */
export function useChat() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, Set<string>>>(new Map());
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [threadMessages, setThreadMessages] = useState<ChatMessageType[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<ConversationType | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [fileUploads, setFileUploads] = useState<Record<string, any>>({});
  
  // Use refs to store the current values so they're available in event listeners
  const messagesRef = useRef(messages);
  const conversationsRef = useRef(conversations);
  const typingUsersRef = useRef(typingUsers);
  const notificationsRef = useRef(notifications);
  const socketRef = useRef(socket);
  
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);
  
  useEffect(() => {
    typingUsersRef.current = typingUsers;
  }, [typingUsers]);
  
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);
  
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  
  // Initialize socket connection
  useEffect(() => {
    if (!token) return;
    
    setConnecting(true);
    const socketInstance = io({
      path: '/api/socket/chat',
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    setSocket(socketInstance);

    socketInstance.on(ChatEvents.CONNECT, () => {
      console.log('Socket connected');
      setConnected(true);
      setConnecting(false);
      setError(null);
    });

    socketInstance.on(ChatEvents.CONNECT_ERROR, (err) => {
      console.error('Socket connection error', err);
      setConnected(false);
      setConnecting(false);
      setError(err);
    });

    socketInstance.on(ChatEvents.DISCONNECT, (reason) => {
      console.log('Socket disconnected', reason);
      setConnected(false);
    });

    // Event listeners for chat events
    socketInstance.on(ChatEvents.RECEIVE_MESSAGE, (newMessage: ChatMessageType) => {
      setMessages(prevMessages => {
        // Check if message already exists to prevent duplicates
        if (prevMessages.some(msg => msg.id === newMessage.id)) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
      
      // Update the conversation's last message
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === newMessage.conversationId) {
            return {
              ...conv,
              lastMessage: newMessage.content,
              lastMessageAt: newMessage.createdAt,
              updatedAt: newMessage.createdAt,
              unreadCount: (conv.unreadCount || 0) + (newMessage.senderId !== session?.user?.id ? 1 : 0)
            };
          }
          return conv;
        });
      });
      
      // Calculate total unread count
      calculateUnreadCount();
    });

    socketInstance.on(ChatEvents.TYPING, ({ userId }: { userId: string }) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (!activeConversation) return newMap;
        
        const conversationId = activeConversation.id;
        if (!newMap.has(conversationId)) {
          newMap.set(conversationId, new Set<string>());
        }
        
        const userSet = newMap.get(conversationId);
        if (userSet) {
          userSet.add(userId);
        }
        
        return newMap;
      });
    });

    socketInstance.on(ChatEvents.STOP_TYPING, ({ userId }: { userId: string }) => {
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (!activeConversation) return newMap;
        
        const conversationId = activeConversation.id;
        const userSet = newMap.get(conversationId);
        if (userSet) {
          userSet.delete(userId);
        }
        
        return newMap;
      });
    });

    socketInstance.on(ChatEvents.MESSAGES_READ, ({ 
      conversationId,
      userId 
    }: { 
      conversationId: string;
      userId: string;
    }) => {
      // Skip if it's the current user's read status
      if (userId === session?.user?.id) return;
      
      // Mark messages as read for the specific user
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.conversationId === conversationId && !msg.isRead) {
            return { ...msg, isRead: true, readAt: new Date().toISOString() };
          }
          return msg;
        });
      });
    });

    socketInstance.on(ChatEvents.USER_ONLINE, ({ userId }: { userId: string }) => {
      // Handle user online status
      console.log(`User online: ${userId}`);
      // You could update a list of online users here
    });

    socketInstance.on(ChatEvents.USER_OFFLINE, ({ userId }: { userId: string }) => {
      // Handle user offline status
      console.log(`User offline: ${userId}`);
    });

    // Group chat events
    socketInstance.on(ChatEvents.GROUP_CREATED, (group: GroupConversationType) => {
      setConversations(prev => {
        // Check if group already exists
        if (prev.some(c => c.id === group.id)) {
          return prev;
        }
        return [...prev, group];
      });
    });

    socketInstance.on(ChatEvents.MEMBER_ADDED, ({ 
      conversationId, 
      newMember, 
      addedBy, 
      role 
    }: { 
      conversationId: string,
      newMember: string,
      addedBy: string,
      role: string
    }) => {
      // Update the group's members if it's the current user being added
      if (newMember === session?.user?.id) {
        // Fetch the group conversation details
        fetchConversations();
      } else {
        // Update the members list in the existing conversation
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === conversationId && conv.isGroup) {
              return {
                ...conv,
                members: [...(conv.members || []), newMember]
              };
            }
            return conv;
          });
        });
      }
    });

    socketInstance.on(ChatEvents.MEMBER_REMOVED, ({ 
      conversationId, 
      removedMember, 
      removedBy 
    }: { 
      conversationId: string,
      removedMember: string,
      removedBy: string
    }) => {
      // Check if current user was removed
      if (removedMember === session?.user?.id) {
        // Remove the conversation from the list
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        
        // If this was the active conversation, clear it
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }
      } else {
        // Update the members list
        setConversations(prev => {
          return prev.map(conv => {
            if (conv.id === conversationId && conv.isGroup) {
              return {
                ...conv,
                members: (conv.members || []).filter(id => id !== removedMember)
              };
            }
            return conv;
          });
        });
      }
    });

    socketInstance.on(ChatEvents.GROUP_UPDATED, (updatedGroup: GroupConversationType) => {
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === updatedGroup.id) {
            return updatedGroup;
          }
          return conv;
        });
      });
    });

    // Thread events
    socketInstance.on(ChatEvents.THREAD_REPLY_RECEIVED, (reply: ChatMessageType) => {
      // Update thread messages if this is for the active thread
      if (activeThreadId === reply.replyTo) {
        setThreadMessages(prev => {
          if (prev.some(msg => msg.id === reply.id)) {
            return prev;
          }
          return [...prev, reply];
        });
      }
      
      // Update the reply count for the parent message
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === reply.replyTo) {
            return {
              ...msg,
              replyCount: (msg.replyCount || 0) + 1
            };
          }
          return msg;
        });
      });
    });

    // Set up cleanup
    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [token, session?.user?.id, activeConversation]);

  // Calculate total unread count
  const calculateUnreadCount = useCallback(() => {
    const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    setUnreadCount(total);
  }, [conversations]);

  // Effect to calculate unread count when conversations change
  useEffect(() => {
    calculateUnreadCount();
  }, [conversations, calculateUnreadCount]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return [];

    try {
      const response = await fetch('/api/chat/conversations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations);
      return data.conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }, [session?.user?.id]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId: string, before?: Date) => {
    if (!session?.user?.id) return [];

    try {
      let url = `/api/chat/messages?conversationId=${conversationId}`;
      if (before) {
        url += `&before=${before.toISOString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Update messages state if this is for the active conversation
      if (activeConversation?.id === conversationId) {
        // Prepend messages if loading older ones, otherwise replace
        if (before) {
          setMessages(prev => [...data.messages, ...prev]);
        } else {
          setMessages(data.messages);
        }
      }
      
      return data.messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }, [session?.user?.id, activeConversation]);

  // Send a message
  const sendMessage = useCallback((conversationId: string, content: string, attachments?: any, replyToMessageId?: string) => {
    if (!socket || !connected || !session?.user?.id) {
      setError(new Error('Cannot send message: not connected'));
      return;
    }
    
    // Emit message event
    socket.emit(ChatEvents.SEND_MESSAGE, { 
      conversationId, 
      content,
      attachments,
      replyTo: replyToMessageId
    });
    
    // Stop typing indication
    socket.emit(ChatEvents.STOP_TYPING, { conversationId });
  }, [socket, connected, session?.user?.id]);

  // Mark messages as read
  const markMessageAsRead = useCallback((conversationId: string) => {
    if (!socket || !connected || !session?.user?.id) return;
    
    socket.emit(ChatEvents.MARK_READ, { conversationId });
    
    // Optimistically update the conversation's unread count
    setConversations(prev => {
      return prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      });
    });
    
    // Recalculate total unread count
    calculateUnreadCount();
  }, [socket, connected, session?.user?.id, calculateUnreadCount]);

  // Join a conversation
  const joinConversation = useCallback((conversationId: string) => {
    if (!socket || !connected) return;
    
    socket.emit(ChatEvents.JOIN_CONVERSATION, conversationId);
  }, [socket, connected]);

  // Leave a conversation
  const leaveConversation = useCallback((conversationId: string) => {
    if (!socket || !connected) return;
    
    socket.emit(ChatEvents.LEAVE_CONVERSATION, conversationId);
  }, [socket, connected]);

  // Send typing status
  const sendTypingStatus = useCallback((conversationId: string, isTyping: boolean) => {
    if (!socket || !connected) return;
    
    socket.emit(
      isTyping ? ChatEvents.TYPING : ChatEvents.STOP_TYPING, 
      { conversationId }
    );
  }, [socket, connected]);

  // Create a group conversation
  const createGroup = useCallback(async (name: string, memberIds: string[], description?: string, iconUrl?: string) => {
    if (!socket || !connected || !session?.user?.id) {
      throw new Error('Cannot create group: not connected');
    }
    
    return new Promise<GroupConversationType>((resolve, reject) => {
      // Set up a one-time listener for the response
      const handleGroupCreated = (group: GroupConversationType) => {
        socket?.off(ChatEvents.GROUP_CREATED, handleGroupCreated);
        resolve(group);
      };
      
      socket.on(ChatEvents.GROUP_CREATED, handleGroupCreated);
      
      // Set a timeout for the response
      const timeout = setTimeout(() => {
        socket?.off(ChatEvents.GROUP_CREATED, handleGroupCreated);
        reject(new Error('Create group timed out'));
      }, 10000);
      
      // Emit create group event
      socket.emit(ChatEvents.CREATE_GROUP, { 
        name,
        memberIds,
        description,
        iconUrl
      });
    });
  }, [socket, connected, session?.user?.id]);

  // Add a member to a group
  const addGroupMember = useCallback((conversationId: string, userId: string, role?: string) => {
    if (!socket || !connected) return;
    
    socket.emit(ChatEvents.ADD_MEMBER, { 
      conversationId, 
      userId,
      role 
    });
  }, [socket, connected]);

  // Remove a member from a group
  const removeGroupMember = useCallback((conversationId: string, userId: string) => {
    if (!socket || !connected) return;
    
    socket.emit(ChatEvents.REMOVE_MEMBER, { 
      conversationId, 
      userId 
    });
  }, [socket, connected]);

  // Update a group conversation
  const updateGroup = useCallback((
    conversationId: string,
    updates: {
      name?: string;
      description?: string;
      iconUrl?: string;
    }
  ) => {
    if (!socket || !connected) return;
    
    socket.emit(ChatEvents.EDIT_GROUP, { 
      conversationId,
      ...updates 
    });
  }, [socket, connected]);

  // Leave a group
  const leaveGroup = useCallback((conversationId: string) => {
    if (!socket || !connected || !session?.user?.id) return;
    
    socket.emit(ChatEvents.REMOVE_MEMBER, { 
      conversationId, 
      userId: session.user.id 
    });
  }, [socket, connected, session?.user?.id]);

  // Add a reaction to a message
  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!socket || !connected) return;
    
    socket.emit(ChatEvents.ADD_REACTION, { messageId, emoji });
  }, [socket, connected]);

  // Remove a reaction from a message
  const removeReaction = useCallback((messageId: string, emoji: string) => {
    if (!socket || !connected) return;
    
    socket.emit(ChatEvents.REMOVE_REACTION, { messageId, emoji });
  }, [socket, connected]);

  // Load thread replies
  const loadThreadReplies = useCallback(async (messageId: string) => {
    if (!session?.user?.id) return [];

    try {
      const response = await fetch(`/api/chat/thread?messageId=${messageId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch thread replies');
      }
      
      const data = await response.json();
      setThreadMessages(data.messages);
      setActiveThreadId(messageId);
      return data.messages;
    } catch (error) {
      console.error('Error fetching thread replies:', error);
      return [];
    }
  }, [session?.user?.id]);

  // Send a thread reply
  const sendThreadReply = useCallback((parentMessageId: string, content: string, attachments?: any) => {
    if (!socket || !connected || !session?.user?.id) {
      setError(new Error('Cannot send thread reply: not connected'));
      return;
    }
    
    // Get the conversation ID from the parent message
    const parentMessage = messagesRef.current.find(msg => msg.id === parentMessageId);
    if (!parentMessage) {
      setError(new Error('Cannot find parent message'));
      return;
    }
    
    const conversationId = parentMessage.conversationId;
    
    // Emit thread reply event
    socket.emit(ChatEvents.SEND_MESSAGE, { 
      conversationId, 
      content,
      attachments,
      replyTo: parentMessageId
    });
  }, [socket, connected, session?.user?.id]);

  // Select a conversation as active
  const selectConversation = useCallback((conversation: ConversationType) => {
    setActiveConversation(conversation);
    
    // Join the conversation room
    if (socketRef.current && connected) {
      socketRef.current.emit(ChatEvents.JOIN_CONVERSATION, conversation.id);
    }
    
    // Load messages for the conversation
    fetchMessages(conversation.id);
    
    // Mark messages as read
    markMessageAsRead(conversation.id);
  }, [connected, fetchMessages, markMessageAsRead]);

  // Clear active conversation
  const clearActiveConversation = useCallback(() => {
    if (activeConversation) {
      // Leave the conversation room
      if (socketRef.current && connected) {
        socketRef.current.emit(ChatEvents.LEAVE_CONVERSATION, activeConversation.id);
      }
    }
    
    setActiveConversation(null);
    setMessages([]);
  }, [activeConversation, connected]);

  // Automatically fetch conversations when the component mounts and user is authenticated
  useEffect(() => {
    if (session?.user?.id && token) {
      fetchConversations();
    }
  }, [session?.user?.id, token, fetchConversations]);

  // Send a file attachment to a conversation
  const sendFileAttachment = useCallback(
    async (
      conversationId: string,
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<string | null> => {
      if (!connected || !socket) return null;
      
      try {
        // Create a form data object
        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', conversationId);
        
        // Create a virtual URL for immediate display in UI
        const tempUrl = URL.createObjectURL(file);
        
        // Generate a temporary ID for the file
        const tempId = crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}`;
        
        // Signal upload start
        setFileUploads(prev => ({
          ...prev,
          [tempId]: {
            id: tempId,
            name: file.name,
            size: file.size,
            type: file.type,
            progress: 0,
            url: tempUrl,
            status: 'uploading'
          }
        }));
        
        // Send the actual file to the server (using fetch for progress tracking)
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            
            // Update progress
            setFileUploads(prev => ({
              ...prev,
              [tempId]: {
                ...prev[tempId],
                progress
              }
            }));
            
            // Call progress callback if provided
            if (onProgress) {
              onProgress(progress);
            }
          }
        });
        
        // Set up promise to track completion
        const uploadPromise = new Promise<string>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                
                // Update with actual server URL
                setFileUploads(prev => ({
                  ...prev,
                  [tempId]: {
                    ...prev[tempId],
                    id: response.id,
                    url: response.url,
                    status: 'complete',
                    progress: 100
                  }
                }));
                
                resolve(response.id);
              } catch (err) {
                reject(new Error('Invalid response format'));
              }
            } else {
              setFileUploads(prev => ({
                ...prev,
                [tempId]: {
                  ...prev[tempId],
                  status: 'error',
                  error: `Server error: ${xhr.status}`
                }
              }));
              
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          };
          
          xhr.onerror = () => {
            setFileUploads(prev => ({
              ...prev,
              [tempId]: {
                ...prev[tempId],
                status: 'error',
                error: 'Network error'
              }
            }));
            
            reject(new Error('Network error'));
          };
          
          xhr.onabort = () => {
            setFileUploads(prev => ({
              ...prev,
              [tempId]: {
                ...prev[tempId],
                status: 'cancelled'
              }
            }));
            
            reject(new Error('Upload cancelled'));
          };
        });
        
        // Start the upload
        xhr.open('POST', '/api/chat/upload', true);
        xhr.send(formData);
        
        return tempId;
      } catch (error) {
        console.error('Error sending file attachment:', error);
        return null;
      }
    },
    [connected, socket]
  );

  // Cancel an ongoing file upload
  const cancelFileUpload = useCallback((fileId: string) => {
    setFileUploads(prev => {
      if (!prev[fileId]) return prev;
      
      // If the upload has an XHR object, abort it
      if (prev[fileId].xhr) {
        prev[fileId].xhr.abort();
      }
      
      // Remove the file from the uploads state
      const newUploads = { ...prev };
      delete newUploads[fileId];
      
      return newUploads;
    });
  }, []);

  return {
    // Connection state
    socket,
    connected,
    connecting,
    error,
    
    // Data
    activeConversation,
    conversations,
    messages,
    typingUsers,
    unreadCount,
    threadMessages,
    activeThreadId,
    fileUploads,
    
    // Actions
    fetchConversations,
    fetchMessages,
    sendMessage,
    joinConversation,
    leaveConversation,
    markMessageAsRead,
    sendTypingStatus,
    selectConversation,
    clearActiveConversation,
    
    // Group actions
    createGroup,
    updateGroup,
    leaveGroup,
    addGroupMember,
    removeGroupMember,
    
    // Thread actions
    loadThreadReplies,
    sendThreadReply,
    setActiveThreadId,
    
    // Reaction actions
    addReaction,
    removeReaction,
    
    // File attachment actions
    sendFileAttachment,
    cancelFileUpload,
  };
}
