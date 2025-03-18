import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ThreadMessageType } from '../ThreadPanel';

interface SocketNotificationsOptions {
  userId: string;
  onNewMessage?: (message: any) => void;
  onNewThreadReply?: (message: ThreadMessageType, parentMessageId: string) => void;
  onMessageRead?: (messageId: string) => void;
  onThreadRead?: (parentMessageId: string) => void;
}

/**
 * Hook for handling real-time socket notifications for chat and thread replies
 */
export function useSocketNotifications({
  userId,
  onNewMessage,
  onNewThreadReply,
  onMessageRead,
  onThreadRead
}: SocketNotificationsOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
      withCredentials: true,
      auth: {
        userId
      }
    });

    // Setup event listeners
    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // Handle new regular messages
    socketInstance.on('newMessage', (message) => {
      if (message.senderId !== userId && onNewMessage) {
        onNewMessage(message);
      }
    });

    // Handle new thread replies
    socketInstance.on('newThreadReply', (data) => {
      const { message, parentMessageId } = data;
      if (message.senderId !== userId && onNewThreadReply) {
        onNewThreadReply(message, parentMessageId);
      }
    });

    // Handle message read status updates
    socketInstance.on('messageRead', (messageId) => {
      if (onMessageRead) {
        onMessageRead(messageId);
      }
    });

    // Handle thread read status updates
    socketInstance.on('threadRead', (parentMessageId) => {
      if (onThreadRead) {
        onThreadRead(parentMessageId);
      }
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [userId, onNewMessage, onNewThreadReply, onMessageRead, onThreadRead]);

  // Emit events
  const emitThreadReply = (message: ThreadMessageType, parentMessageId: string) => {
    if (socket && connected) {
      socket.emit('threadReply', { message, parentMessageId });
    }
  };

  const emitThreadRead = (parentMessageId: string) => {
    if (socket && connected) {
      socket.emit('threadRead', parentMessageId);
    }
  };

  // Return socket state and emitter functions
  return {
    connected,
    emitThreadReply,
    emitThreadRead
  };
}
