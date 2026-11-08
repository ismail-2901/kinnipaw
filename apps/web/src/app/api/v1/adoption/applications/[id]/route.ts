import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, updateAdoptionApplicationSchema } from '@kinnipaw/contracts';
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication required', requestId),
        { status: 401 }
      );
    }

    const { data: application, error } = await supabase
      .from('adoption_applications')
      .select(`
        *,
        applicant:profiles(id, username, display_name, avatar_path, city, area_label),
        listing:adoption_listings(
          id,
          listed_by,
          listing_status,
          animal:animals(
            *,
            species:species(common_name),
            media:animal_media(media_url, is_primary)
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Application not found', requestId),
        { status: 404 }
      );
    }

    const listing = (application as any).listing;
    if (application.applicant_id !== user.id && listing?.listed_by !== user.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Access denied to this application', requestId),
        { status: 403 }
      );
    }

    // Fetch status history
    const { data: history } = await supabase
      .from('adoption_status_history')
      .select('*')
      .eq('application_id', id)
      .order('changed_at', { ascending: true });

    return NextResponse.json(
      createSuccessResponse({ ...application, history: history || [] }, requestId)
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
    const parsed = updateAdoptionApplicationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid update data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const { data: application, error: appError } = await supabase
      .from('adoption_applications')
      .select(`
        id,
        applicant_id,
        application_status,
        listing:adoption_listings(id, listed_by)
      `)
      .eq('id', id)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Application not found', requestId),
        { status: 404 }
      );
    }

    const listing = (application as any).listing;
    const isLister = listing?.listed_by === user.id;
    const isApplicant = application.applicant_id === user.id;

    if (!isLister && !isApplicant) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Access denied to this application', requestId),
        { status: 403 }
      );
    }

    // Validate permitted transitions
    const newStatus = parsed.data.application_status;
    if (newStatus === 'withdrawn' && !isApplicant) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Only the applicant can withdraw an application', requestId),
        { status: 403 }
      );
    }

    if ((newStatus === 'approved' || newStatus === 'rejected' || newStatus === 'under_review') && !isLister) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Only the listing owner can review applications', requestId),
        { status: 403 }
      );
    }

    const { data: updatedApp, error: updateError } = await supabase
      .from('adoption_applications')
      .update({ application_status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', updateError.message, requestId),
        { status: 400 }
      );
    }

    // If status is approved, update listing status to adopted
    if (newStatus === 'approved' && listing?.id) {
      await supabase
        .from('adoption_listings')
        .update({ listing_status: 'adopted' })
        .eq('id', listing.id);
    }

    // Add optional note to history if provided
    if (parsed.data.notes) {
      await supabase
        .from('adoption_status_history')
        .insert({
          application_id: id,
          from_status: application.application_status,
          to_status: newStatus,
          changed_by: user.id,
          notes: sanitizeInput(parsed.data.notes),
        });
    }

    return NextResponse.json(createSuccessResponse(updatedApp, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
