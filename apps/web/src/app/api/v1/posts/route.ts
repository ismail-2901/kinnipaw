import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

const createPostSchema = z.object({
  body: z.string().min(1, 'Post content cannot be empty').max(3000),
  post_type: z.enum(['text', 'media', 'link', 'care_tip']).default('text'),
  visibility: z.enum(['public', 'followers', 'group_only']).default('public'),
  group_id: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);
    const cursor = searchParams.get('cursor');

    const supabase = await createClient();

    let query = supabase
      .from('posts')
      .select('*, author:profiles(id, username, display_name, avatar_path), post_media(*), reactions(reaction_type, user_id)')
      .eq('is_published', true)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data: posts, error } = await query;

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId, null));
    }

    const hasMore = (posts?.length || 0) > limit;
    const items = hasMore ? posts!.slice(0, limit) : (posts || []);
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].created_at : null;

    return NextResponse.json(createSuccessResponse(items, requestId, nextCursor));
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
        createErrorResponse('UNAUTHORIZED', 'Authentication required to post', requestId),
        { status: 401 }
      );
    }

    const json = await request.json();
    const parsed = createPostSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid post data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const postPayload = {
      author_id: user.id,
      body: sanitizeInput(parsed.data.body),
      post_type: parsed.data.post_type,
      visibility: parsed.data.visibility,
      is_published: true,
      published_at: new Date().toISOString(),
    };

    const { data: post, error } = await supabase
      .from('posts')
      .insert(postPayload)
      .select('*, author:profiles(id, username, display_name, avatar_path)')
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    // If posted inside a group, associate in group_posts
    if (parsed.data.group_id) {
      await supabase.from('group_posts').insert({
        group_id: parsed.data.group_id,
        post_id: post.id,
        added_by: user.id,
      });
    }

    return NextResponse.json(createSuccessResponse(post, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
