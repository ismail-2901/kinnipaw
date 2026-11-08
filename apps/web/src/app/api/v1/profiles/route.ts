import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  bio: z.string().max(300).optional(),
  city: z.string().max(50).optional(),
  area_label: z.string().max(50).optional(),
  preferred_locale: z.enum(['en', 'bn']).optional(),
});

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

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // Return fallback dev profile if DB not yet seeded
      return NextResponse.json(
        createSuccessResponse(
          {
            id: user.id,
            username: user.email?.split('@')[0] || 'user',
            display_name: user.user_metadata?.display_name || 'Guardian',
            avatar_path: null,
            bio: null,
            preferred_locale: 'en',
            city: null,
            area_label: null,
            account_status: 'active',
          },
          requestId
        )
      );
    }

    return NextResponse.json(createSuccessResponse(profile, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const parsed = updateProfileSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid profile fields', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const updatePayload: Record<string, string | undefined> = {};
    if (parsed.data.display_name) updatePayload.display_name = sanitizeInput(parsed.data.display_name);
    if (parsed.data.bio !== undefined) updatePayload.bio = sanitizeInput(parsed.data.bio);
    if (parsed.data.city !== undefined) updatePayload.city = sanitizeInput(parsed.data.city);
    if (parsed.data.area_label !== undefined) updatePayload.area_label = sanitizeInput(parsed.data.area_label);
    if (parsed.data.preferred_locale) updatePayload.preferred_locale = parsed.data.preferred_locale;

    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(updated, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
