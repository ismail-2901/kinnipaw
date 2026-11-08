import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, sendMessageSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 30, 50);

    // Verify membership
    const { data: member } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Access denied to this conversation', requestId),
        { status: 403 }
      );
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        body,
        sent_at,
        is_deleted,
        sender:profiles(id, username, display_name, avatar_path),
        attachments:message_attachments(id, storage_path, media_type, file_size_bytes)
      `)
      .eq('conversation_id', id)
      .eq('is_deleted', false)
      .order('sent_at', { ascending: true })
      .limit(limit);

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    // Update last_read_at for this user
    await supabase
      .from('conversation_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .eq('user_id', user.id);

    return NextResponse.json(createSuccessResponse(messages || [], requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

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
        createErrorResponse('UNAUTHORIZED', 'Authentication required', requestId),
        { status: 401 }
      );
    }

    // Verify membership
    const { data: member } = await supabase
      .from('conversation_members')
      .select('id')
      .eq('conversation_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Access denied to this conversation', requestId),
        { status: 403 }
      );
    }

    const json = await request.json();
    const parsed = sendMessageSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid message data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: user.id,
        body: sanitizeInput(parsed.data.body),
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        body,
        sent_at,
        sender:profiles(id, username, display_name, avatar_path)
      `)
      .single();

    if (messageError) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', messageError.message, requestId),
        { status: 400 }
      );
    }

    // Touch conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json(createSuccessResponse(message, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
