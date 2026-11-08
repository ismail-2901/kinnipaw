import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, registerDeviceTokenSchema } from '@kinnipaw/contracts';
import { createClient } from '@/lib/supabase/server';

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
    const parsed = registerDeviceTokenSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid device token data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const { data: token, error } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: user.id,
        token: parsed.data.token,
        platform: parsed.data.platform,
      }, { onConflict: 'user_id,token' })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(token, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
