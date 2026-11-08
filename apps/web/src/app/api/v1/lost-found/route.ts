import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createLostFoundPostSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
    const cursor = searchParams.get('cursor');
    const reportType = searchParams.get('type'); // 'lost' | 'found'
    const status = searchParams.get('status') || 'active';
    const area = searchParams.get('area');

    const supabase = await createClient();

    let query = supabase
      .from('lost_found_posts')
      .select(`
        *,
        reporter:profiles(id, username, display_name, avatar_path, city, area_label),
        species:species(id, common_name, is_domestic),
        animal:animals(id, name, breed_id, sex, size_category, breeds(name))
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (reportType === 'lost' || reportType === 'found') {
      query = query.eq('report_type', reportType);
    }

    if (area) {
      query = query.ilike('last_seen_area_label', `%${area}%`);
    }

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: posts, error } = await query;

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId, null));
    }

    const hasMore = (posts?.length || 0) > limit;
    const items = hasMore ? posts!.slice(0, limit) : (posts || []);
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
        createErrorResponse('UNAUTHORIZED', 'Authentication required', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = createLostFoundPostSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid lost/found report data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const postPayload = {
      reporter_id: user.id,
      report_type: parsed.data.report_type,
      species_id: parsed.data.species_id,
      animal_id: parsed.data.animal_id || null,
      description: sanitizeInput(parsed.data.description),
      last_seen_area_label: sanitizeInput(parsed.data.last_seen_area_label),
      incident_date: parsed.data.incident_date,
      media_paths: parsed.data.media_paths || [],
      status: 'active' as const,
    };

    const { data: post, error } = await supabase
      .from('lost_found_posts')
      .insert(postPayload)
      .select(`
        *,
        reporter:profiles(id, username, display_name, avatar_path),
        species:species(common_name)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    // Rule-based deterministic matching (PB-056)
    // Find active opposite reports for the same species and matching coarse area
    const oppositeType = parsed.data.report_type === 'lost' ? 'found' : 'lost';
    const { data: candidates } = await supabase
      .from('lost_found_posts')
      .select('id, reporter_id, last_seen_area_label')
      .eq('report_type', oppositeType)
      .eq('species_id', parsed.data.species_id)
      .eq('status', 'active')
      .limit(5);

    if (candidates && candidates.length > 0) {
      for (const cand of candidates) {
        const lostId = parsed.data.report_type === 'lost' ? post.id : cand.id;
        const foundId = parsed.data.report_type === 'found' ? post.id : cand.id;

        await supabase.from('lost_found_matches').insert({
          lost_post_id: lostId,
          found_post_id: foundId,
          match_status: 'user_reported',
          confidence_score: 0.65,
          notes: `Rule match: Same species and reported in ${post.last_seen_area_label}`,
        });
      }
    }

    return NextResponse.json(createSuccessResponse(post, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
