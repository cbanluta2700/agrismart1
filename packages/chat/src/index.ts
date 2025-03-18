/**
 * Chat System Package
 * 
 * This package provides both client and server-side utilities
 * for implementing a real-time chat system using Socket.io.
 */

// Export client implementation only from the main entry point
// to prevent server-side code from being imported in client components
export * from './client';

// Export types
export * from './types';

// Server code is now exported separately through a dedicated entry point
// and should only be imported in server components or API routes
