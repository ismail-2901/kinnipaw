import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, aiCareAssistantSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';
import { askPetCareAssistant } from '@/lib/ai/provider';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication required to consult care assistant', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = aiCareAssistantSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid query', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const sanitizedQuery = sanitizeInput(parsed.data.query);

    // Call abstracted assistant with strict guardrails
    const result = await askPetCareAssistant(sanitizedQuery, parsed.data.species);

    // Track provenance in ai_jobs
    await supabase.from('ai_jobs').insert({
      requested_by: user.id,
      job_type: 'care_tip',
      provider: 'kinnipaw-rules-engine',
      model: 'care-assistant-v1',
      status: 'completed',
      input_summary: sanitizedQuery.slice(0, 100),
      tokens_used: 120,
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
