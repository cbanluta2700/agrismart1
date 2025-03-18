/**
 * Common utility functions and types for AI Assistant components
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Types for utility functions from SaasFly UI
export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(' ');
}
