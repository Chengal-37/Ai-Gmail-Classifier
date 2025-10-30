// src/lib/gmail.ts
import { RawEmail, ProcessedEmail, RawEmailPart } from './types';

// Utility function to decode Base64 URL-safe strings
const decodeBase64 = (base64Url: string): string => {
  try {
    // Prevent decoding extremely large blobs (attachments) which can OOM the server.
    const MAX_BASE64_LENGTH = 200_000; // ~150KB decoded
    const SAFE_OUTPUT_CHARS = 2000;

    if (base64Url.length > MAX_BASE64_LENGTH) {
      // Try to decode only the beginning portion to give a useful snippet
      const partial = base64Url.slice(0, MAX_BASE64_LENGTH);
      const base64 = partial.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = Buffer.from(base64, 'base64').toString('utf-8');
      return decoded.substring(0, SAFE_OUTPUT_CHARS) + '\n\n<<content truncated>>';
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    return decoded.substring(0, SAFE_OUTPUT_CHARS);
  } catch (error) {
    console.error('Failed to decode base64:', error);
    return '';
  }
};

// Recursive function to extract the main body content (prioritizes text/plain)
function extractBodyContent(parts: RawEmailPart[] | undefined): string {
    if (!parts || parts.length === 0) return '';
  
    // 1. Prioritize parts with text/plain or text/html
    const textPart = parts.find(p => p.mimeType === 'text/plain' && p.body.data) ||
                     parts.find(p => p.mimeType === 'text/html' && p.body.data);
  
    if (textPart && textPart.body.data) {
      return decodeBase64(textPart.body.data);
    }
  
    // 2. Recurse into nested parts (e.g., multipart/mixed)
    for (const part of parts) {
      if (part.parts) {
        const content = extractBodyContent(part.parts);
        if (content) return content;
      }
    }
  
    // 3. Fallback to the main body if no parts were found but body is present
    const mainBodyPart = parts.find(p => p.body.data);
    if (mainBodyPart && mainBodyPart.body.data) {
        return decodeBase64(mainBodyPart.body.data);
    }

    return '';
}

// Main function to fetch and process emails
export async function fetchAndProcessEmails(accessToken: string, maxResults: number = 15): Promise<ProcessedEmail[]> {
  const GMAIL_MESSAGES_ENDPOINT = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';

  // 1. List the message IDs
  const listResponse = await fetch(`${GMAIL_MESSAGES_ENDPOINT}?maxResults=${maxResults}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store' // Do not cache the dynamic user data
  });

  if (!listResponse.ok) {
    // Try to extract a useful error body (JSON or text) to make debugging easier
    let details = '';
    try {
      const bodyText = await listResponse.text();
      // Try to pretty-print JSON errors
      try {
        const json = JSON.parse(bodyText);
        details = JSON.stringify(json, null, 2);
      } catch (_e) {
        details = bodyText;
      }
    } catch (err) {
      details = `Could not read error body: ${String(err)}`;
    }

    throw new Error(`Gmail API List Error: ${listResponse.status} ${listResponse.statusText}. ${details}`);
  }

  const listData = await listResponse.json();
  const messageIds = listData.messages?.map((m: any) => m.id) || [];
  
  if (messageIds.length === 0) {
    return [];
  }

  // 2. Fetch the full message content for all IDs concurrently
  const fetchPromises = messageIds.map((id: string) => 
    fetch(`${GMAIL_MESSAGES_ENDPOINT}/${id}?format=full`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      cache: 'no-store'
    }).then(res => res.json())
  );
  
  const rawEmails: RawEmail[] = await Promise.all(fetchPromises);

  // 3. Process the raw emails into our application structure
  const processedEmails: ProcessedEmail[] = rawEmails.map(rawEmail => {
    
    const headers = rawEmail.payload.headers;
    const getHeader = (name: string) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || 'N/A';

    const subject = getHeader('Subject');
    const from = getHeader('From');
    const date = getHeader('Date');
    
    // Extract body content
  const bodyContent = extractBodyContent(rawEmail.payload.parts).substring(0, 500);
    
    return {
      id: rawEmail.id,
      from: from,
      subject: subject,
      snippet: rawEmail.snippet,
      bodyPreview: bodyContent.substring(0, 500), // Max 500 chars of body
      date: new Date(date).toLocaleString(),
      classification: undefined,
    };
  });

  return processedEmails;
}