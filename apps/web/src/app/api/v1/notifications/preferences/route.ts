import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, updateNotificationPreferencesSchema } from '@kinnipaw/contracts';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
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

    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const defaultPrefs = {
      email_notifications: true,
      push_notifications: true,
      adoption_alerts: true,
      rescue_alerts: true,
      care_reminders: true,
    };

    return NextResponse.json(createSuccessResponse(prefs || defaultPrefs, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const parsed = updateNotificationPreferencesSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid preferences data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const { data: updated, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...parsed.data,
      }, { onConflict: 'user_id' })
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
