import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createAdoptionListingSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
    const cursor = searchParams.get('cursor');
    const species = searchParams.get('species');
    const status = searchParams.get('status') || 'active';

    const supabase = await createClient();

    let query = supabase
      .from('adoption_listings')
      .select(`
        *,
        lister:profiles(id, username, display_name, avatar_path, city, area_label),
        animal:animals(
          id,
          name,
          species_id,
          breed_id,
          sex,
          size_category,
          date_of_birth,
          bio,
          species:species(id, common_name, scientific_name, is_domestic),
          breed:breeds(id, name),
          media:animal_media(id, media_url, is_primary)
        )
      `)
      .eq('listing_status', status)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: listings, error } = await query;

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId, null));
    }

    // Filter by species if requested
    let filtered = listings || [];
    if (species) {
      filtered = filtered.filter(
        (l: any) => l.animal?.species?.common_name?.toLowerCase() === species.toLowerCase()
      );
    }

    const hasMore = filtered.length > limit;
    const items = hasMore ? filtered.slice(0, limit) : filtered;
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
        createErrorResponse('UNAUTHORIZED', 'Authentication required to list for adoption', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = createAdoptionListingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid adoption listing data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    // AGENTS.md §14: Species and jurisdiction safety check
    // Verify that the animal belongs to the user and is a domestic species
    const { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id, owner_id, species:species(is_domestic, common_name)')
      .eq('id', parsed.data.animal_id)
      .single();

    if (animalError || !animal) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Animal record not found', requestId),
        { status: 404 }
      );
    }

    if (animal.owner_id !== user.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'You can only list animals registered to your account', requestId),
        { status: 403 }
      );
    }

    const speciesInfo = (animal as any).species;
    if (speciesInfo && speciesInfo.is_domestic === false) {
      return NextResponse.json(
        createErrorResponse(
          'FORBIDDEN_SPECIES',
          'Adoption listing of protected or non-domestic wildlife is prohibited by Bangladesh Wildlife Act 2012',
          requestId
        ),
        { status: 403 }
      );
    }

    const listingPayload = {
      animal_id: parsed.data.animal_id,
      listed_by: user.id,
      listing_status: parsed.data.listing_status,
      description: parsed.data.description ? sanitizeInput(parsed.data.description) : null,
      adoption_requirements: parsed.data.adoption_requirements ? sanitizeInput(parsed.data.adoption_requirements) : null,
      fee_description: parsed.data.fee_description ? sanitizeInput(parsed.data.fee_description) : null,
      listed_at: new Date().toISOString(),
    };

    const { data: listing, error } = await supabase
      .from('adoption_listings')
      .insert(listingPayload)
      .select(`
        *,
        animal:animals(id, name)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(listing, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
