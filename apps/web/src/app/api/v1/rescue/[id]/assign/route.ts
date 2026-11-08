import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createRescueAssignmentSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

export async function POST(
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
        createErrorResponse('UNAUTHORIZED', 'Authentication required to volunteer', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = createRescueAssignmentSchema.safeParse({ ...json, rescue_case_id: id });

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid assignment data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const { data: rescueCase, error: caseError } = await supabase
      .from('rescue_cases')
      .select('id, case_status')
      .eq('id', id)
      .single();

    if (caseError || !rescueCase) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Rescue case not found', requestId),
        { status: 404 }
      );
    }

    // Create assignment
    const assignmentPayload = {
      rescue_case_id: id,
      assigned_to: user.id,
      assigned_by: user.id,
      assignment_status: 'active' as const,
      notes: parsed.data.notes ? sanitizeInput(parsed.data.notes) : 'Volunteered to assist with rescue',
    };

    const { data: assignment, error: assignError } = await supabase
      .from('rescue_assignments')
      .insert(assignmentPayload)
      .select()
      .single();

    if (assignError) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', assignError.message, requestId),
        { status: 400 }
      );
    }

    // Update case status to assigned
    await supabase
      .from('rescue_cases')
      .update({ case_status: 'assigned' })
      .eq('id', id);

    // Record status event
    await supabase.from('rescue_status_events').insert({
      rescue_case_id: id,
      from_status: rescueCase.case_status,
      to_status: 'assigned',
      changed_by: user.id,
      notes: 'Volunteer claimed case assignment.',
    });

    return NextResponse.json(createSuccessResponse(assignment, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
