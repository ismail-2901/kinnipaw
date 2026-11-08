import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

const createReportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'misinformation', 'animal_cruelty', 'illegal_trade', 'other']),
  details: z.string().max(1000).nullable().optional(),
  post_id: z.string().uuid().optional(),
  comment_id: z.string().uuid().optional(),
  profile_id: z.string().uuid().optional(),
  listing_id: z.string().uuid().optional(),
  rescue_case_id: z.string().uuid().optional(),
  lost_found_post_id: z.string().uuid().optional(),
}).refine(
  (data) => {
    const fks = [data.post_id, data.comment_id, data.profile_id, data.listing_id, data.rescue_case_id, data.lost_found_post_id].filter(Boolean);
    return fks.length === 1;
  },
  {
    message: 'Exactly one target entity must be reported (ADR-023)',
  }
);

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication required to report content', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = createReportSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid report submission', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const reportPayload = {
      reporter_id: user.id,
      reason: parsed.data.reason,
      details: parsed.data.details ? sanitizeInput(parsed.data.details) : null,
      post_id: parsed.data.post_id || null,
      comment_id: parsed.data.comment_id || null,
      profile_id: parsed.data.profile_id || null,
      listing_id: parsed.data.listing_id || null,
      rescue_case_id: parsed.data.rescue_case_id || null,
      lost_found_post_id: parsed.data.lost_found_post_id || null,
      report_status: 'pending' as const,
    };

    const { data: created, error } = await supabase
      .from('content_reports')
      .insert(reportPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(created, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
