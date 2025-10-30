import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Scopes required:
// 'email', 'profile' are standard.
// 'https://www.googleapis.com/auth/gmail.readonly' is essential for fetching emails.
const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: `openid profile email ${GMAIL_READONLY_SCOPE}`,
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
