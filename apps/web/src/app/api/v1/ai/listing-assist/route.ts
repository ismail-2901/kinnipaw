import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, aiListingAssistSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';
import { generateListingCopy } from '@/lib/ai/provider';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication required', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = aiListingAssistSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid listing assist attributes', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const name = sanitizeInput(parsed.data.name);
    const species = sanitizeInput(parsed.data.species);
    const traits = parsed.data.traits?.map((t) => sanitizeInput(t));
    const specialNeeds = parsed.data.special_needs ? sanitizeInput(parsed.data.special_needs) : undefined;

    const result = await generateListingCopy(name, species, traits, specialNeeds);

    // Track provenance in ai_jobs
    await supabase.from('ai_jobs').insert({
      requested_by: user.id,
      job_type: 'listing_assist',
      provider: 'kinnipaw-rules-engine',
      model: 'copy-generator-v1',
      status: 'completed',
      input_summary: `Listing copy for ${name} (${species})`,
      tokens_used: 150,
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json(createSuccessResponse(result, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
