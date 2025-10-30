
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, maxResults = 15 } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    // 1. Fetch the list of message IDs
    const listResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listResponse.ok) {
      const errorData = await listResponse.json();
      console.error('[GMAIL_API_LIST_ERROR]', errorData);
      return NextResponse.json({ error: 'Failed to fetch email list', details: errorData }, { status: listResponse.status });
    }

    const listData = await listResponse.json();
    const messageIds = listData.messages?.map((msg: any) => msg.id) || [];

    if (messageIds.length === 0) {
      return NextResponse.json({ emails: [] }, { status: 200 });
    }

    // 2. Fetch the full details for each message
    const emailPromises = messageIds.map(async (id: string) => {
      const emailResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!emailResponse.ok) {
        console.warn(`Failed to fetch email with ID: ${id}`);
        return null; // Skip this email if it fails
      }

      const emailData = await emailResponse.json();
      const headers = emailData.payload.headers;

      return {
        id: emailData.id,
        sender: headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender',
        subject: headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject',
        snippet: emailData.snippet,
      };
    });

    const emails = (await Promise.all(emailPromises)).filter(Boolean);

    return NextResponse.json({ emails }, { status: 200 });

  } catch (error) {
    console.error('[API_EMAILS_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch emails', details: errorMessage }, { status: 500 });
  }
}
