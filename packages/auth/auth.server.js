// This file contains server-only components of the authentication system
// It should never be imported in client components

// Add the "use server" directive to ensure this is only imported in server components
"use server";

import { getServerSession } from "next-auth";
import { KyselyAdapter } from "@auth/kysely-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { db } from "./db";
import { env } from "./env.mjs";
import { createEmailProvider } from "./email-provider.server";

// Auth options with server-side components
export const authOptions = {
  session: {
    strategy: "jwt",
  },
  adapter: KyselyAdapter(db),
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/check-email",
  },
  providers: [
    // Email provider with server-side implementation
    createEmailProvider(),
    
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db
          .selectFrom("User")
          .selectAll()
          .where("email", "=", credentials.email.toLowerCase())
          .executeTakeFirst();

        if (!user?.password) return null;

        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: Boolean(user.isAdmin),
        };
      },
    }),
    
    // GitHub provider is conditionally enabled
    ...(env.GITHUB_CLIENT_ID !== "dev-placeholder" 
      ? [
          GitHubProvider({
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
      
    // Google provider is conditionally enabled
    ...(env.GOOGLE_CLIENT_ID !== "dev-placeholder"
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.sub || token.id;
        session.user.isAdmin = token.isAdmin;
        session.id = token.sub || token.id; // For backward compatibility
        session.isAdmin = token.isAdmin; // For backward compatibility
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
  },
  debug: env.IS_DEBUG === "true",
};

// Auth function for server components and API routes
export async function auth(...args) {
  return getServerSession(...args, authOptions);
}

// Function to get the current user in server components
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
