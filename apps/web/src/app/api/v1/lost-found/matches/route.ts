import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, updateMatchSchema } from '@kinnipaw/contracts';
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
    const postId = searchParams.get('post_id');

    let query = supabase
      .from('lost_found_matches')
      .select(`
        *,
        lost_post:lost_found_posts!lost_post_id(
          id,
          report_type,
          description,
          last_seen_area_label,
          incident_date,
          status,
          species:species(common_name)
        ),
        found_post:lost_found_posts!found_post_id(
          id,
          report_type,
          description,
          last_seen_area_label,
          incident_date,
          status,
          species:species(common_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (postId) {
      query = query.or(`lost_post_id.eq.${postId},found_post_id.eq.${postId}`);
    }

    const { data: matches, error } = await query;

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    return NextResponse.json(createSuccessResponse(matches || [], requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const matchId = json.id;
    if (!matchId) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Match ID is required', requestId),
        { status: 422 }
      );
    }

    const parsed = updateMatchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid match update data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    // AGENTS.md §17: Human verification strictly required for match confirmation
    const updates: Record<string, unknown> = {
      match_status: parsed.data.match_status,
      confirmed_by: user.id,
      confirmed_at: new Date().toISOString(),
    };
    if (parsed.data.notes) {
      updates.notes = parsed.data.notes;
    }

    const { data: match, error } = await supabase
      .from('lost_found_matches')
      .update(updates)
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    // If confirmed, optionally resolve both posts
    if (parsed.data.match_status === 'confirmed' && match) {
      await supabase
        .from('lost_found_posts')
        .update({ status: 'resolved', resolved_by: user.id, resolved_at: new Date().toISOString() })
        .in('id', [match.lost_post_id, match.found_post_id]);
    }

    return NextResponse.json(createSuccessResponse(match, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
