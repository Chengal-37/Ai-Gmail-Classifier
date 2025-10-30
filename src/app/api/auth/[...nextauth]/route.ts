// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions as any);

// Export GET and POST handlers for Next.js App Router
export { handler as GET, handler as POST };

// ------------------------------------------
// EXTEND TYPES FOR TYPESCRIPT SAFETY (IMPORTANT)
// ------------------------------------------
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Returned by the `jwt` callback
   */
  interface JWT {
    accessToken?: string;
  }
}