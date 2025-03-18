// Type definitions for shared auth types that are safe to import in client components
import type { User } from "next-auth";

// These types represent the custom session properties
export type UserId = string;
export type IsAdmin = boolean;

// Extend the session type with our custom properties
declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      isAdmin: IsAdmin;
    };
    id: UserId;
    isAdmin: IsAdmin;
  }
}

// Extend the JWT type with our custom properties
declare module "next-auth" {
  interface JWT {
    isAdmin: IsAdmin;
  }
}
