/**
 * Auth Client Module
 * 
 * This file contains client-safe authentication utilities that don't depend on
 * server-only packages like nodemailer.
 */

"use client";

import type { User } from "next-auth";
import { useSession as useNextAuthSession } from "next-auth/react";

// Extend the session type with our custom properties
declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      isAdmin: boolean;
    };
    id: string;
    isAdmin: boolean;
  }
}

// Extend the JWT type with our custom properties
declare module "next-auth" {
  interface JWT {
    isAdmin: boolean;
  }
}

// Export useSession hook with proper typing
export function useSession() {
  return useNextAuthSession();
}

// Export convenience hooks for checking auth state
export function useIsAuthenticated() {
  const { data: session, status } = useSession();
  return status === "authenticated" && !!session?.user;
}

export function useIsAdmin() {
  const { data: session } = useSession();
  return !!session?.user?.isAdmin;
}

// Export other client-safe utilities as needed
