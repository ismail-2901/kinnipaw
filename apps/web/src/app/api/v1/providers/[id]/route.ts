import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = crypto.randomUUID();

  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: provider, error } = await supabase
      .from('provider_profiles')
      .select(`
        id,
        user_id,
        provider_type,
        public_name,
        verification_status,
        public_address,
        description,
        created_at,
        services:provider_services(id, service_name, description, price_range_description, is_active),
        reviews:provider_reviews(
          id,
          rating,
          body,
          created_at,
          reviewer:profiles(id, username, display_name, avatar_path)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !provider) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Provider not found', requestId),
        { status: 404 }
      );
    }

    const ratings = provider.reviews?.map((r: { rating: number }) => r.rating) || [];
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;

    return NextResponse.json(
      createSuccessResponse({
        ...provider,
        average_rating: avgRating ? parseFloat(avgRating) : null,
        review_count: ratings.length,
      }, requestId)
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
