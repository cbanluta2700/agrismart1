/**
 * Database Package
 * 
 * This package exports utilities for interacting with the database.
 * It includes both the Prisma client for ORM functionality and
 * direct Neon Serverless PostgreSQL utilities for optimized queries.
 */

// Export Prisma Client
export { db } from './lib/db';
export * from '@prisma/client';

// Export Neon Database Utilities
export * from './neon-db';

// Export Database Types
export * from './types';

// Export Chat System
export * from './chat-system';

// Export AI Assistant
export * from './ai-assistant';

// Provide backward compatibility for existing code
export { PrismaClient } from '@prisma/client';
