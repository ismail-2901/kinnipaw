import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, updateContentReportSchema } from '@kinnipaw/contracts';
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
    const parsed = updateContentReportSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid moderation data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const { data: report, error: reportError } = await supabase
      .from('content_reports')
      .update({
        report_status: parsed.data.report_status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', reportError?.message || 'Report not found', requestId),
        { status: 400 }
      );
    }

    // Record in immutable audit_logs
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: `report.${parsed.data.report_status}`,
      subject_type: 'content_report',
      subject_id: id,
      payload: {
        action: parsed.data.action,
        notes: parsed.data.notes ? sanitizeInput(parsed.data.notes) : null,
      },
    });

    return NextResponse.json(createSuccessResponse(report, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
