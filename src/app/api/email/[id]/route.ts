
import { NextResponse } from 'next/server';

// Helper to decode base64url which is used by Gmail API
function base64UrlDecode(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  while (input.length % 4) {
    input += '=';
  }
  // The atob function decodes a string of data which has been encoded using Base64 encoding.
  // We use it here to decode the email body.
  // We are using Buffer.from as atob is not available in node.js environment
  return Buffer.from(input, 'base64').toString('utf-8');
}

// Searches for the email body, prioritizing HTML over plain text.
function getBody(payload: any): string {
    const partsToVisit = [payload];
    let htmlBody = '';
    let textBody = '';

    while(partsToVisit.length > 0) {
        const part = partsToVisit.shift();
        if(!part) continue;

        if (part.body && part.body.data) {
            if (part.mimeType === 'text/html') {
                // Once we've found the HTML body, we can stop.
                htmlBody = base64UrlDecode(part.body.data);
                break;
            } else if (part.mimeType === 'text/plain') {
                textBody = base64UrlDecode(part.body.data);
            }
        }
        
        // If the part is multipart, add its sub-parts to the list to visit.
        if (part.parts) {
            // Using unshift to perform a depth-first search to find the most specific part first.
            partsToVisit.unshift(...part.parts);
        }
    }
    
    if (htmlBody) {
        return htmlBody;
    }
    
    // If no HTML body, fall back to plain text.
    if (textBody) {
        return textBody.replace(/\n/g, '<br />');
    }
    
    return '';
}


export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { accessToken } = await req.json();
    const messageId = params.id;

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('[GMAIL_API_GET_ERROR]', errorData);
        return NextResponse.json({ error: 'Failed to fetch email details', details: errorData }, { status: response.status });
    }

    const emailData = await response.json();
    const { headers } = emailData.payload;

    const sender = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
    const date = headers.find((h: any) => h.name === 'Date')?.value || '';

    const body = getBody(emailData.payload);

    return NextResponse.json({
        id: emailData.id,
        sender,
        subject,
        date,
        body
    }, { status: 200 });

  } catch (error) {
    console.error('[API_EMAIL_DETAIL_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch email details', details: errorMessage }, { status: 500 });
  }
}
