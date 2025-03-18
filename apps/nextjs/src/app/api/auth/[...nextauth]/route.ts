import NextAuth from "next-auth";
import { authOptions } from "@saasfly/auth/auth.server";

// Use type assertion to handle version incompatibility between packages and app
const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
