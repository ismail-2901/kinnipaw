import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication required to delete account', requestId),
        { status: 401 }
      );
    }

    // 1. Audit log the deletion request
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'account_deletion_requested',
      target_type: 'user',
      target_id: user.id,
      details: {
        reason: 'User self-service data deletion request',
        timestamp: new Date().toISOString(),
      },
    });

    // 2. Deactivate device tokens
    await supabase
      .from('device_tokens')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // 3. Mark user profile as deactivated / anonymized
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: 'Former Member',
        bio: '[Account Deleted]',
        avatar_url: null,
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', updateError.message, requestId),
        { status: 500 }
      );
    }

    return NextResponse.json(
      createSuccessResponse(
        {
          deleted: true,
          message: 'Account deletion and data anonymization successfully initiated.',
        },
        requestId
      ),
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', err.message || 'Failed to delete account', requestId),
      { status: 500 }
    );
  }
}
