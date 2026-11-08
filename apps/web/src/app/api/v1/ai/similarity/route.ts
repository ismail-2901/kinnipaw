import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, aiSimilarityCheckSchema } from '@kinnipaw/contracts';
import { createClient } from '@/lib/supabase/server';
import { computeSimilarity } from '@/lib/ai/provider';

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
    const parsed = aiSimilarityCheckSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid post IDs', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    // Fetch both posts
    const [{ data: lostPost }, { data: candidatePost }] = await Promise.all([
      supabase.from('lost_found_posts').select('id, description, species_id').eq('id', parsed.data.lost_post_id).single(),
      supabase.from('lost_found_posts').select('id, description, species_id').eq('id', parsed.data.candidate_post_id).single(),
    ]);

    if (!lostPost || !candidatePost) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'One or both posts could not be found', requestId),
        { status: 404 }
      );
    }

    const similarity = await computeSimilarity(lostPost.description, candidatePost.description);

    // Create ai_job
    const { data: job } = await supabase
      .from('ai_jobs')
      .insert({
        requested_by: user.id,
        job_type: 'lost_found_match',
        provider: 'kinnipaw-rules-engine',
        model: 'similarity-v1',
        status: 'completed',
        input_summary: `Similarity comparison between ${lostPost.id} and ${candidatePost.id}`,
        tokens_used: 80,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Record candidate in ai_match_candidates
    if (job) {
      await supabase.from('ai_match_candidates').insert({
        ai_job_id: job.id,
        lost_post_id: lostPost.id,
        candidate_post_id: candidatePost.id,
        confidence_score: similarity.confidence_score,
        reasoning_summary: similarity.reasoning,
        candidate_status: 'pending_review',
      });
    }

    return NextResponse.json(createSuccessResponse(similarity, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
