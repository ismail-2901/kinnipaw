-- KINNIPAW — Gate M8 Migration: AI Jobs, Match Candidates, and Advisory Tracking
-- Status: Versioned SQL forward migration per MIGRATIONS.md
-- Governing ADRs: ADR-013, ADR-015, AGENTS.md §17 (Strict AI guardrails: advisory only, no veterinary diagnosis)

BEGIN;

-- 1. AI JOBS TABLE
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL CHECK (job_type IN ('lost_found_match', 'care_tip', 'behavior_analysis', 'listing_assist', 'moderation_assist')),
  provider TEXT NOT NULL,
  model TEXT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  input_summary TEXT NULL,
  tokens_used INTEGER NULL,
  error_message TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ NULL
);

-- 2. AI MATCH CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS public.ai_match_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_job_id UUID NOT NULL REFERENCES public.ai_jobs(id) ON DELETE CASCADE,
  lost_post_id UUID NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  candidate_post_id UUID NOT NULL REFERENCES public.lost_found_posts(id) ON DELETE CASCADE,
  confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
  reasoning_summary TEXT NULL,
  candidate_status TEXT DEFAULT 'pending_review' CHECK (candidate_status IN ('pending_review', 'accepted', 'rejected')),
  reviewed_by UUID NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_ai_jobs_user ON public.ai_jobs(requested_by);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_match_job ON public.ai_match_candidates(ai_job_id);
CREATE INDEX IF NOT EXISTS idx_ai_match_lost ON public.ai_match_candidates(lost_post_id);

-- 4. ROW LEVEL SECURITY
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_match_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI jobs"
ON public.ai_jobs FOR SELECT
TO authenticated
USING (requested_by = auth.uid());

CREATE POLICY "Users can create AI jobs"
ON public.ai_jobs FOR INSERT
TO authenticated
WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Users can update own AI jobs"
ON public.ai_jobs FOR UPDATE
TO authenticated
USING (requested_by = auth.uid());

CREATE POLICY "Users can view relevant match candidates"
ON public.ai_match_candidates FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.lost_found_posts p
    WHERE (p.id = lost_post_id OR p.id = candidate_post_id) AND p.reporter_id = auth.uid()
  )
);

CREATE POLICY "Staff can update match candidates"
ON public.ai_match_candidates FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.lost_found_posts p
    WHERE (p.id = lost_post_id OR p.id = candidate_post_id) AND p.reporter_id = auth.uid()
  )
);

COMMIT;
