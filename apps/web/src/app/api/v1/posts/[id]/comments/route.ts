import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

const createCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(1000),
  parent_comment_id: z.string().uuid().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*, author:profiles(id, username, display_name, avatar_path)')
      .eq('post_id', id)
      .eq('is_visible', true)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    return NextResponse.json(createSuccessResponse(comments || [], requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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
    const parsed = createCommentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid comment body', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const commentPayload = {
      post_id: id,
      author_id: user.id,
      parent_comment_id: parsed.data.parent_comment_id || null,
      body: sanitizeInput(parsed.data.body),
      is_visible: true,
    };

    const { data: comment, error } = await supabase
      .from('comments')
      .insert(commentPayload)
      .select('*, author:profiles(id, username, display_name, avatar_path)')
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(comment, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
