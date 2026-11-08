import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createAdoptionApplicationSchema } from '@kinnipaw/contracts';
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
    const role = searchParams.get('role') || 'applicant'; // applicant | lister

    if (role === 'lister') {
      // Find applications for listings posted by this user
      const { data: applications, error } = await supabase
        .from('adoption_applications')
        .select(`
          *,
          applicant:profiles(id, username, display_name, avatar_path, city, area_label),
          listing:adoption_listings(
            id,
            listing_status,
            animal:animals(id, name, species:species(common_name))
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        return NextResponse.json(createSuccessResponse([], requestId));
      }
      return NextResponse.json(createSuccessResponse(applications || [], requestId));
    }

    // Default: My applications as applicant
    const { data: applications, error } = await supabase
      .from('adoption_applications')
      .select(`
        *,
        listing:adoption_listings(
          id,
          listing_status,
          listed_by,
          animal:animals(id, name, species:species(common_name))
        )
      `)
      .eq('applicant_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    return NextResponse.json(createSuccessResponse(applications || [], requestId));
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
    const parsed = createAdoptionApplicationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid application data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    // Verify listing is active and user is not listing owner
    const { data: listing, error: listingError } = await supabase
      .from('adoption_listings')
      .select('id, listed_by, listing_status')
      .eq('id', parsed.data.listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Adoption listing not found', requestId),
        { status: 404 }
      );
    }

    if (listing.listed_by === user.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Cannot apply to adopt your own animal', requestId),
        { status: 403 }
      );
    }

    if (listing.listing_status !== 'active') {
      return NextResponse.json(
        createErrorResponse('BAD_REQUEST', 'Listing is no longer accepting applications', requestId),
        { status: 400 }
      );
    }

    // Prevent duplicate active applications
    const { data: existingApp } = await supabase
      .from('adoption_applications')
      .select('id')
      .eq('listing_id', parsed.data.listing_id)
      .eq('applicant_id', user.id)
      .not('application_status', 'in', '("rejected","withdrawn")')
      .maybeSingle();

    if (existingApp) {
      return NextResponse.json(
        createErrorResponse('CONFLICT', 'You already have an active application for this listing', requestId),
        { status: 409 }
      );
    }

    const applicationPayload = {
      listing_id: parsed.data.listing_id,
      applicant_id: user.id,
      application_status: 'submitted' as const,
      answers: parsed.data.answers as any,
    };

    const { data: application, error } = await supabase
      .from('adoption_applications')
      .insert(applicationPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(application, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
