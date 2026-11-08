import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 30, 50);
    const status = searchParams.get('status');

    let query = supabase
      .from('profiles')
      .select(`
        id,
        username,
        display_name,
        city,
        area_label,
        account_status,
        created_at,
        roles:user_role_assignments(role:roles(name))
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('account_status', status as any);
    }

    const { data: profiles, error } = await query;

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    const formatted = (profiles || []).map((p) => ({
      ...p,
      roles: (p.roles || []).map((r: any) => r.role?.name).filter(Boolean),
    }));

    return NextResponse.json(createSuccessResponse(formatted, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
