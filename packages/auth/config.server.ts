/**
 * Server-only Authentication Configuration
 * 
 * This file contains the NextAuth configuration that uses server-only
 * packages like nodemailer. It should never be imported in client components.
 */

import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { KyselyAdapter } from "@auth/kysely-adapter";
import { getServerSession, type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { MagicLinkEmail, resend, siteConfig } from "@saasfly/common";

import { db } from "./db";
import { env } from "./env.mjs";

// Re-export the auth options but mark it as server-only
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  adapter: KyselyAdapter(db) as any,
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/check-email",
  },
  providers: [
    // Email provider with nodemailer (server-only)
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: env.EMAIL_SERVER_PORT,
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        try {
          await resend.emails.send({
            from: `${siteConfig.name} <${env.EMAIL_FROM}>`,
            to: [identifier],
            subject: `Sign in to ${siteConfig.name}`,
            react: MagicLinkEmail({ url }),
          });
        } catch (error) {
          console.error("Failed to send verification email", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
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
          .select(["id", "name", "email", "password", "isAdmin"])
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
        session.user.id = token.sub as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.id = token.sub as string; // For backward compatibility
        session.isAdmin = token.isAdmin as boolean; // For backward compatibility
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin as boolean;
      }
      return token;
    },
  },
  debug: env.IS_DEBUG === "true",
};

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
