import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, updateLostFoundPostSchema } from '@kinnipaw/contracts';
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

    const { data: post, error } = await supabase
      .from('lost_found_posts')
      .select(`
        *,
        reporter:profiles!lost_found_posts_reporter_id_fkey(id, username, display_name, avatar_path, city, area_label),
        species:species(id, common_name, is_domestic),
        animal:animals(id, name, sex, size_category, breeds(name))
      `)
      .eq('id', id)
      .single();

    if (error || !post) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Lost/found report not found', requestId),
        { status: 404 }
      );
    }

    // Sightings
    const { data: sightings } = await supabase
      .from('lost_found_sightings')
      .select('*, reporter:profiles(id, username, display_name, avatar_path)')
      .eq('lost_found_post_id', id)
      .order('sighting_date', { ascending: false });

    return NextResponse.json(
      createSuccessResponse({ ...post, sightings: sightings || [] }, requestId)
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
    const parsed = updateLostFoundPostSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid update data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) {
      updates.status = parsed.data.status;
      if (parsed.data.status === 'resolved') {
        updates.resolved_by = user.id;
        updates.resolved_at = new Date().toISOString();
      }
    }
    if (parsed.data.description !== undefined) {
      updates.description = sanitizeInput(parsed.data.description);
    }
    if (parsed.data.last_seen_area_label !== undefined) {
      updates.last_seen_area_label = sanitizeInput(parsed.data.last_seen_area_label);
    }

    const { data: post, error } = await supabase
      .from('lost_found_posts')
      .update(updates)
      .eq('id', id)
      .eq('reporter_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(post, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
