import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, updateUserStatusSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

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
    const parsed = updateUserStatusSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid user status data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ account_status: parsed.data.account_status })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', updateError?.message || 'User not found', requestId),
        { status: 400 }
      );
    }

    // Record in immutable audit_logs
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: `user.${parsed.data.account_status}`,
      subject_type: 'profile',
      subject_id: id,
      payload: {
        reason: sanitizeInput(parsed.data.reason),
      },
    });

    return NextResponse.json(createSuccessResponse(updatedProfile, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
