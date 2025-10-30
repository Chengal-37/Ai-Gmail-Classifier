// src/lib/types.ts

// --- GMAIL API TYPES ---
export interface RawEmail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    // We only care about the body content for classification
    parts?: RawEmailPart[];
    body: {
        data: string;
        size: number;
    }
  };
}

export interface RawEmailPart {
    partId: string;
    mimeType: string;
    filename: string;
    headers: Array<{
        name: string;
        value: string;
    }>;
    body: {
        data?: string;
        size: number;
    };
    parts?: RawEmailPart[]; // Recursive for multipart emails
}


// --- CLASSIFICATION TYPES ---

// The structure we enforce on the AI's output (using Zod later)
export type ClassificationCategory =
  | 'Important'
  | 'Promotional'
  | 'Social'
  | 'Marketing'
  | 'Spam'
  | 'General';

export interface EmailClassification {
  id: string; // The ID of the email being classified
  category: ClassificationCategory;
  summary: string; // A brief, one-sentence summary of the email
  actionable: boolean; // True if the email requires a user action (reply, payment, etc.)
}

// --- FINAL APPLICATION DATA MODEL ---

// The clean, processed email structure used in the frontend
export interface ProcessedEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  bodyPreview: string; // Extracted and cleaned body part
  date: string; // Human-readable date
  classification?: EmailClassification; // Optional until classified
}

// Data structure for the API response
export interface EmailResponse {
    emails: ProcessedEmail[];
    error?: string;
}