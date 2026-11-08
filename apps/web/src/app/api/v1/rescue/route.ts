import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createRescueCaseSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
    const cursor = searchParams.get('cursor');
    const status = searchParams.get('status') || 'open';
    const urgency = searchParams.get('urgency');

    const supabase = await createClient();

    let query = supabase
      .from('rescue_cases')
      .select(`
        *,
        reporter:profiles!rescue_cases_reported_by_fkey(id, username, display_name, avatar_path),
        species:species(id, common_name, is_domestic),
        assignments:rescue_assignments(id, assigned_to, assignment_status, assigned_to_profile:profiles!rescue_assignments_assigned_to_fkey(display_name))
      `)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (status !== 'all') {
      query = query.eq('case_status', status);
    }

    if (urgency) {
      query = query.eq('urgency', urgency);
    }

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: cases, error } = await query;

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId, null));
    }

    const hasMore = (cases?.length || 0) > limit;
    const items = hasMore ? cases!.slice(0, limit) : (cases || []);
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].created_at : null;

    return NextResponse.json(createSuccessResponse(items, requestId, nextCursor));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication required to report rescue cases', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = createRescueCaseSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid rescue case data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    // Check species domestic status per AGENTS.md §14 (Species & Jurisdiction Safety)
    const { data: speciesRecord } = await supabase
      .from('species')
      .select('is_domestic, common_name')
      .eq('id', parsed.data.species_id)
      .single();

    const isWildlife = speciesRecord ? speciesRecord.is_domestic === false : parsed.data.is_wildlife;

    const casePayload = {
      reported_by: user.id,
      species_id: parsed.data.species_id,
      description: sanitizeInput(parsed.data.description),
      location_area_label: sanitizeInput(parsed.data.location_area_label),
      urgency: parsed.data.urgency,
      case_status: 'open' as const,
      is_wildlife: isWildlife,
      media_paths: parsed.data.media_paths || [],
    };

    const { data: rescueCase, error } = await supabase
      .from('rescue_cases')
      .insert(casePayload)
      .select(`
        *,
        reporter:profiles(id, username, display_name),
        species:species(common_name)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    // Record initial status in rescue_status_events
    await supabase.from('rescue_status_events').insert({
      rescue_case_id: rescueCase.id,
      from_status: null,
      to_status: 'open',
      changed_by: user.id,
      notes: isWildlife
        ? 'Case opened. Flagged for authorized wildlife rescue authorities (Bangladesh Forest Dept protocol).'
        : 'Case opened by reporter.',
    });

    return NextResponse.json(createSuccessResponse(rescueCase, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
