import { NextAuthOptions, Session, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { User } from "next-auth";

// Import UserRole from the DB package
import prisma from "@saasfly/db";
import { UserRole } from "@saasfly/db";

// Define a custom session type that includes role information
export interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: UserRole;
  };
}

// Extend the User type from next-auth to include role
interface CustomUser extends User {
  role?: UserRole;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Use prisma client directly
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || UserRole.BUYER, // Default to BUYER if role is not set
        } as CustomUser;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            role: (token.role as UserRole) || UserRole.BUYER, // Default to BUYER if role is not set
          },
        } as CustomSession;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        return {
          ...token,
          id: customUser.id,
          role: customUser.role || UserRole.BUYER, // Default to BUYER if role is not set
        };
      }
      return token;
    },
  },
};

export async function auth(): Promise<CustomSession | null> {
  const session = await getServerSession(authOptions);
  return session as CustomSession | null;
}
