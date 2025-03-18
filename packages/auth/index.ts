/**
 * Authentication Package
 * 
 * This is the main entry point for the auth package
 * Server-only components are imported in auth.server.ts
 * Client-only components are imported in client.ts
 */

// Re-export types that are safe to use in both client and server components
export * from "./types";

// Export the client-side hooks and utilities
export * from "./client";

// Export database and env (these are safe to import in client components)
export { db } from "./db";
export { env } from "./env.mjs";

// Note: Server-side components are exported from auth.server.ts 
// and should be imported directly in server components 
// using: import { auth } from "@saasfly/auth/auth.server";
