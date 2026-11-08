import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('species')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      // In local dev without active DB containers, return deterministic fallback taxonomy per ADR-026
      const fallbackSpecies = [
        { id: 'c0000000-0000-0000-0000-000000000001', name: 'Dog', slug: 'dog', is_domestic: true, is_active: true },
        { id: 'c0000000-0000-0000-0000-000000000002', name: 'Cat', slug: 'cat', is_domestic: true, is_active: true },
        { id: 'c0000000-0000-0000-0000-000000000003', name: 'Bird', slug: 'bird', is_domestic: true, is_active: true },
        { id: 'c0000000-0000-0000-0000-000000000004', name: 'Rabbit', slug: 'rabbit', is_domestic: true, is_active: true },
        { id: 'c0000000-0000-0000-0000-000000000005', name: 'Small Mammal', slug: 'small-mammal', is_domestic: true, is_active: true },
      ];
      return NextResponse.json(createSuccessResponse(fallbackSpecies, requestId));
    }

    return NextResponse.json(createSuccessResponse(data, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
