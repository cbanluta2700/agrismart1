/**
 * Socket.io Chat API Route
 * 
 * This API route initializes the Socket.io server for real-time chat
 * between buyers and sellers on the AgriSmart platform.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketServer } from 'socket.io';
import { initializeSocketServer } from '@saasfly/chat';

// Define a global variable to store the Socket.io server instance
// to prevent re-initialization on hot reloads
let ioInstance: SocketServer;

/**
 * Socket.io handler for chat functionality
 */
export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  // Server-sent events protocol
  if (res.socket && !ioInstance) {
    console.log('Initializing Socket.io server...');
    
    // @ts-ignore - res.socket.server is available but not in the types
    const httpServer = res.socket.server;
    ioInstance = initializeSocketServer(httpServer);
    
    console.log('Socket.io server initialized successfully');
  }
  
  // Return a response to keep the connection alive
  res.status(200).end();
}

// Disable the default body parser as we don't need it for socket.io
export const config = {
  api: {
    bodyParser: false,
  },
};
