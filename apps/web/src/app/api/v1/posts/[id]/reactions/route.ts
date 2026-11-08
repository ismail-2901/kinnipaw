import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { createClient } from '@/lib/supabase/server';

const reactionSchema = z.object({
  reaction_type: z.enum(['like', 'love', 'support', 'celebrate']).default('like'),
});

interface RouteParams {
  params: Promise<{ id: string }>;
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
    const parsed = reactionSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid reaction type', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    // Check if user already reacted
    const { data: existing } = await supabase
      .from('reactions')
      .select('id, reaction_type')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      if (existing.reaction_type === parsed.data.reaction_type) {
        // Toggle off
        await supabase.from('reactions').delete().eq('id', existing.id);
        return NextResponse.json(createSuccessResponse({ action: 'removed' }, requestId));
      } else {
        // Update reaction type
        const { data: updated } = await supabase
          .from('reactions')
          .update({ reaction_type: parsed.data.reaction_type })
          .eq('id', existing.id)
          .select()
          .single();
        return NextResponse.json(createSuccessResponse({ action: 'updated', reaction: updated }, requestId));
      }
    }

    // Insert new reaction
    const { data: created, error } = await supabase
      .from('reactions')
      .insert({
        post_id: id,
        user_id: user.id,
        reaction_type: parsed.data.reaction_type,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse({ action: 'added', reaction: created }, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
