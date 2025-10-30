
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

const classificationSchema = z.object({
  id: z.string(),
  category: z.enum(['Important', 'Promotional', 'Social', 'Spam', 'General']),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emails, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key is required' }, { status: 401 });
    }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided for classification' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `
      You are an intelligent email classification assistant.
      Analyze the content of each email (sender, subject, and snippet) and classify it into one of the following categories:
      - Important: Emails that are personal, urgent, or from known contacts.
      - Promotional: Marketing emails, newsletters, and offers.
      - Social: Notifications from social media platforms.
      - Spam: Unsolicited or malicious emails.
      - General: All other emails that don't fit into the above categories.

      Provide your response as a valid JSON array, where each object contains:
      - "id": The original email ID.
      - "category": The predicted category.
      - "confidence": A score from 0 to 1 indicating your confidence.
      - "reasoning": A brief explanation for your classification.
    `;

    const userPrompt = `
      Please classify the following emails:
      ${JSON.stringify(emails.map(e => ({ id: e.id, sender: e.sender, subject: e.subject, snippet: e.snippet })), null, 2)}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return NextResponse.json({ error: 'OpenAI returned an empty response.' }, { status: 500 });
    }

    // The API might return a top-level object, e.g., { "classifications": [...] }
    let parsedContent = JSON.parse(content);
    if (parsedContent.classifications) {
        parsedContent = parsedContent.classifications;
    }

    const validatedClassifications = z.array(classificationSchema).safeParse(parsedContent);

    if (!validatedClassifications.success) {
      console.error('Zod validation error:', validatedClassifications.error.flatten());
      return NextResponse.json({ error: 'Invalid classification format from OpenAI', details: validatedClassifications.error.flatten() }, { status: 500 });
    }

    return NextResponse.json({ classifications: validatedClassifications.data }, { status: 200 });

  } catch (error: any) {
    console.error('[API_CLASSIFY_ERROR]', error);

    let errorMessage = 'An unknown error occurred';
    let statusCode = 500;

    if (error instanceof OpenAI.APIError) {
      errorMessage = error.message;
      statusCode = error.status || 500;
    } else if (error.name === 'ZodError') {
      errorMessage = 'Validation failed for the OpenAI response';
      statusCode = 500;
    }

    return NextResponse.json({ error: 'Failed to classify emails', details: errorMessage }, { status: statusCode });
  }
}
