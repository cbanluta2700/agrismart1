/**
 * Database connection and utilities for the application
 */

import { createKysely } from "@vercel/postgres-kysely";
import type { DB } from './prisma/types';
import { prisma } from './prisma-client';

// Initialize database connection using Vercel Postgres Kysely
export const db = createKysely<DB>();

// Export database types for use in other modules
export type { DB } from './prisma/types';
export * from './prisma/enums';

// Export chat system functions and types
export * from './src/chat-system';

// Export Prisma client as default for backwards compatibility
export default prisma;