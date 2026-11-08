import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createConversationSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
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

    // Find conversations where user is a member
    const { data: memberRows, error: memberError } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (memberError || !memberRows || memberRows.length === 0) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    const conversationIds = memberRows.map((m) => m.conversation_id);

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_type,
        title,
        created_at,
        updated_at,
        members:conversation_members(
          user_id,
          last_read_at,
          profile:profiles(id, username, display_name, avatar_path)
        ),
        messages:messages(
          id,
          body,
          sent_at,
          sender_id
        )
      `)
      .in('id', conversationIds)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    return NextResponse.json(createSuccessResponse(conversations || [], requestId));
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
    const parsed = createConversationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid conversation data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const otherUserId = parsed.data.participant_id;
    if (otherUserId === user.id) {
      return NextResponse.json(
        createErrorResponse('BAD_REQUEST', 'Cannot start conversation with yourself', requestId),
        { status: 400 }
      );
    }

    // Check if direct conversation already exists between both users
    const { data: userConvs } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (userConvs && userConvs.length > 0) {
      const convIds = userConvs.map((c) => c.conversation_id);
      const { data: match } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', convIds)
        .maybeSingle();

      if (match) {
        return NextResponse.json(createSuccessResponse({ id: match.conversation_id }, requestId));
      }
    }

    // Create new direct conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({
        conversation_type: 'direct',
        created_by: user.id,
      })
      .select()
      .single();

    if (convError || !conv) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', convError?.message || 'Failed to create conversation', requestId),
        { status: 400 }
      );
    }

    // Add both members
    await supabase.from('conversation_members').insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: otherUserId },
    ]);

    // Send initial message if provided
    if (parsed.data.initial_message) {
      await supabase.from('messages').insert({
        conversation_id: conv.id,
        sender_id: user.id,
        body: sanitizeInput(parsed.data.initial_message),
      });
    }

    return NextResponse.json(createSuccessResponse(conv, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
