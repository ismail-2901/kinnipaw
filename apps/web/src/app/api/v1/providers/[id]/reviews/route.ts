import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createProviderReviewSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

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
        createErrorResponse('UNAUTHORIZED', 'Authentication required to write reviews', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = createProviderReviewSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid review data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const reviewPayload = {
      provider_profile_id: id,
      reviewer_id: user.id,
      rating: parsed.data.rating,
      body: parsed.data.body ? sanitizeInput(parsed.data.body) : null,
      is_visible: true,
    };

    const { data: review, error } = await supabase
      .from('provider_reviews')
      .insert(reviewPayload)
      .select('*, reviewer:profiles(id, username, display_name)')
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(review, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
