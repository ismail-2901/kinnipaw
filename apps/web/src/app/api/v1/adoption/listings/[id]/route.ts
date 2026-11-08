import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, updateAdoptionListingSchema } from '@kinnipaw/contracts';
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

    const { data: listing, error } = await supabase
      .from('adoption_listings')
      .select(`
        *,
        lister:profiles(id, username, display_name, avatar_path, city, area_label),
        animal:animals(
          *,
          species:species(id, common_name, scientific_name),
          breed:breeds(id, name),
          media:animal_media(id, media_url, is_primary)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !listing) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Adoption listing not found', requestId),
        { status: 404 }
      );
    }

    return NextResponse.json(createSuccessResponse(listing, requestId));
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
    const parsed = updateAdoptionListingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid update data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const updates: Record<string, any> = {};
    if (parsed.data.listing_status !== undefined) updates.listing_status = parsed.data.listing_status;
    if (parsed.data.description !== undefined) updates.description = sanitizeInput(parsed.data.description);
    if (parsed.data.adoption_requirements !== undefined) updates.adoption_requirements = sanitizeInput(parsed.data.adoption_requirements);
    if (parsed.data.fee_description !== undefined) updates.fee_description = sanitizeInput(parsed.data.fee_description);

    const { data: listing, error } = await supabase
      .from('adoption_listings')
      .update(updates)
      .eq('id', id)
      .eq('listed_by', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(listing, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
