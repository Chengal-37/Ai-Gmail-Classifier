// src/app/api/emails/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchAndProcessEmails } from "@/lib/gmail";
import { NextRequest, NextResponse } from "next/server";
import { EmailResponse } from "@/lib/types";

// This is a Server-Side Route Handler
export async function GET(request: NextRequest) {
  // 1. Get the session (and the access token) securely on the server
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: "Unauthorized: Missing session or access token." },
      { status: 401 }
    );
  }

  try {
    // 2. Read optional `maxResults` query param and call Gmail API accordingly
    const url = new URL(request.url);
    const maxResultsParam = url.searchParams.get('maxResults');
    const maxResults = maxResultsParam ? Math.min(50, Math.max(1, Number(maxResultsParam))) : 15;

    // Quick token introspection to give more helpful error messages when the token
    // is missing scopes or otherwise invalid. This calls Google's tokeninfo endpoint.
    try {
      const tokenInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${session.accessToken}`);
      if (!tokenInfoRes.ok) {
        const ttxt = await tokenInfoRes.text();
        console.warn('Token introspection failed:', tokenInfoRes.status, tokenInfoRes.statusText, ttxt);
      } else {
        const tjson = await tokenInfoRes.json();
        // Log scopes for debugging (server-side only)
        console.debug('Token info:', JSON.stringify(tjson));
        if (tjson.scope && !tjson.scope.includes('https://www.googleapis.com/auth/gmail.readonly')) {
          return NextResponse.json({ error: 'Access token missing Gmail scope. Please sign out and sign in again granting Gmail access.' }, { status: 403 });
        }
      }
    } catch (e) {
      console.warn('Token introspection error:', e);
    }

    // 3. Use the secure access token to call the Gmail API
    const emails = await fetchAndProcessEmails(session.accessToken, maxResults);

    // 3. Return the clean, unprocessed emails to the client
    const response: EmailResponse = { emails: emails };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching emails from Gmail:", error);
    
    // Check if it's a known OAuth/Scope error (e.g. token expired, insufficient scope)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      { error: `Failed to fetch emails: ${errorMessage}. Please try signing in again.` },
      { status: 500 }
    );
  }
}