/**
 * Prisma client instance for database access
 * This module exports a single instance of PrismaClient to be used across the application
 */
import { PrismaClient } from '@prisma/client';

// Create a global prisma instance to prevent multiple instances in development
// See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
