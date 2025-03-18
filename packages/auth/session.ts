/**
 * Session Management for Client Components
 * 
 * This file provides utilities for managing authentication sessions
 * in client components without pulling in server-side dependencies.
 */

import { useSession as useNextAuthSession } from "next-auth/react";

/**
 * Hook for accessing the current user session in client components
 */
export function useSession() {
  return useNextAuthSession();
}

/**
 * Hook for checking if the current user is authenticated
 */
export function useIsAuthenticated() {
  const { data: session, status } = useSession();
  return {
    isAuthenticated: !!session?.user,
    isLoading: status === "loading",
    session,
  };
}

/**
 * Hook for checking if the current user is an admin
 */
export function useIsAdmin() {
  const { data: session, status } = useSession();
  return {
    isAdmin: !!session?.isAdmin,
    isLoading: status === "loading",
    session,
  };
}
