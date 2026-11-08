import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createSightingSchema } from '@kinnipaw/contracts';
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

    const { data: sightings, error } = await supabase
      .from('lost_found_sightings')
      .select('*, reporter:profiles(id, username, display_name, avatar_path)')
      .eq('lost_found_post_id', id)
      .order('sighting_date', { ascending: false });

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    return NextResponse.json(createSuccessResponse(sightings || [], requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

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
        createErrorResponse('UNAUTHORIZED', 'Authentication required to report sightings', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = createSightingSchema.safeParse({ ...json, lost_found_post_id: id });

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid sighting data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const sightingPayload = {
      lost_found_post_id: id,
      reported_by: user.id,
      sighting_area_label: sanitizeInput(parsed.data.sighting_area_label),
      sighting_date: parsed.data.sighting_date,
      notes: parsed.data.notes ? sanitizeInput(parsed.data.notes) : null,
      media_paths: parsed.data.media_paths || [],
    };

    const { data: sighting, error } = await supabase
      .from('lost_found_sightings')
      .insert(sightingPayload)
      .select('*, reporter:profiles(id, username, display_name, avatar_path)')
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(sighting, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
