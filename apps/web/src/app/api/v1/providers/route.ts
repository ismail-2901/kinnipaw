import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createProviderProfileSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
    const type = searchParams.get('type');
    const city = searchParams.get('city');

    const supabase = await createClient();

    let query = supabase
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
        services:provider_services(id, service_name, price_range_description),
        reviews:provider_reviews(rating)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('provider_type', type as any);
    }

    if (city) {
      query = query.ilike('public_address', `%${city}%`);
    }

    const { data: providers, error } = await query;

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    // Compute average ratings
    const formatted = (providers || []).map((p) => {
      const ratings = p.reviews?.map((r: { rating: number }) => r.rating) || [];
      const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;
      return {
        ...p,
        average_rating: avgRating ? parseFloat(avgRating) : null,
        review_count: ratings.length,
      };
    });

    return NextResponse.json(createSuccessResponse(formatted, requestId));
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
    const parsed = createProviderProfileSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid provider data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const providerPayload = {
      user_id: user.id,
      provider_type: parsed.data.provider_type,
      public_name: sanitizeInput(parsed.data.public_name),
      public_address: parsed.data.public_address ? sanitizeInput(parsed.data.public_address) : null,
      description: parsed.data.description ? sanitizeInput(parsed.data.description) : null,
      vet_credentials: parsed.data.vet_credentials as any,
      verification_status: 'unverified' as const,
    };

    const { data: provider, error } = await supabase
      .from('provider_profiles')
      .insert(providerPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(provider, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
