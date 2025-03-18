/**
 * Authentication utilities for the chat system
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@saasfly/auth';

/**
 * Get user session from NextAuth
 */
export async function getSession(req: any, res: any) {
  return await getServerSession(req, res, authOptions);
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(req: any, res: any) {
  const session = await getSession(req, res);
  return !!session?.user;
}

/**
 * Get the current user's ID from session
 */
export function getUserId(session: any) {
  return session?.user?.id;
}

/**
 * Get JWT token from session
 */
export function getToken(session: any) {
  return session?.accessToken;
}

/**
 * User role types
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

/**
 * Check if user has required role
 */
export function hasRole(session: any, requiredRole: UserRole) {
  return session?.user?.role === requiredRole;
}

export { authOptions };
