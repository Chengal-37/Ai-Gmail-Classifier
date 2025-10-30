
// src/lib/classifier.ts
import * as z from 'zod';

// This file contains the shared Zod schemas and their inferred types
// for email classification.

// --- ZOD SCHEMA for Structured Output ---

// Defines the exact structure we want from the AI's JSON output for a single email
export const classificationSchema = z.object({
  category: z.enum([
    'Important',
    'Promotional',
    'Social',
    'Marketing',
    'General',
    'Spam'
  ]),
  summary: z.string().describe('A brief, one-sentence summary of the email content.'),
  actionable: z.boolean().describe('True if the email requires a user action (e.g., reply, pay a bill, confirm a detail). False otherwise.'),
});

// Defines the final JSON response structure for a whole batch of emails
export const batchClassificationSchema = z.array(
    z.object({
        emailId: z.string().describe('The ID of the email being classified.'),
        classification: classificationSchema,
    })
);

// --- INFERRED TYPES ---

export type BatchClassificationResult = z.infer<typeof batchClassificationSchema>;
