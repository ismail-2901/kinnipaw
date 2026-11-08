import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, updateRescueCaseSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: rescueCase, error } = await supabase
      .from('rescue_cases')
      .select(`
        *,
        reporter:profiles(id, username, display_name, avatar_path),
        species:species(id, common_name, is_domestic),
        assignments:rescue_assignments(
          id,
          assignment_status,
          assigned_at,
          notes,
          assigned_to_profile:profiles!assigned_to(id, username, display_name, avatar_path)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !rescueCase) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Rescue case not found', requestId),
        { status: 404 }
      );
    }

    // Status timeline
    const { data: events } = await supabase
      .from('rescue_status_events')
      .select('*, changed_by_profile:profiles!changed_by(display_name)')
      .eq('rescue_case_id', id)
      .order('changed_at', { ascending: true });

    return NextResponse.json(
      createSuccessResponse({ ...rescueCase, events: events || [] }, requestId)
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication required', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = updateRescueCaseSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid update data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const { data: currentCase, error: fetchError } = await supabase
      .from('rescue_cases')
      .select('id, reported_by, case_status')
      .eq('id', id)
      .single();

    if (fetchError || !currentCase) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Rescue case not found', requestId),
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.case_status !== undefined) {
      updates.case_status = parsed.data.case_status;
    }
    if (parsed.data.urgency !== undefined) {
      updates.urgency = parsed.data.urgency;
    }

    const { data: updatedCase, error: updateError } = await supabase
      .from('rescue_cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', updateError.message, requestId),
        { status: 400 }
      );
    }

    // Add note to status history if provided
    if (parsed.data.notes && parsed.data.case_status) {
      await supabase.from('rescue_status_events').insert({
        rescue_case_id: id,
        from_status: currentCase.case_status,
        to_status: parsed.data.case_status,
        changed_by: user.id,
        notes: sanitizeInput(parsed.data.notes),
      });
    }

    return NextResponse.json(createSuccessResponse(updatedCase, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
